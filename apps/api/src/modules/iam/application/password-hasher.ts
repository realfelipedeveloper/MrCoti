import { Buffer } from "node:buffer";
import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: string,
  keyLength: number,
  options: ScryptOptions,
) => Promise<Buffer>;

const HASH_PREFIX = "mrcoti-scrypt-v1";

const DEFAULT_SCRYPT_OPTIONS = {
  blockSize: 8,
  cost: 16_384,
  keyLength: 64,
  maxmem: 32 * 1024 * 1024,
  parallelization: 1,
  saltLength: 16,
} as const;

export interface ScryptPasswordHasherOptions {
  readonly blockSize?: number;
  readonly cost?: number;
  readonly keyLength?: number;
  readonly maxmem?: number;
  readonly parallelization?: number;
  readonly saltLength?: number;
}

export interface PasswordHasher {
  hash(plainPassword: string): Promise<string>;
  verify(plainPassword: string, encodedHash: string): Promise<boolean>;
}

interface ParsedScryptHash {
  readonly digest: Buffer;
  readonly keyLength: number;
  readonly options: ScryptOptions;
  readonly salt: string;
}

export class PasswordHashingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PasswordHashingError";
  }
}

export class ScryptPasswordHasher implements PasswordHasher {
  private readonly options: Required<ScryptPasswordHasherOptions>;

  constructor(options: ScryptPasswordHasherOptions = {}) {
    this.options = {
      ...DEFAULT_SCRYPT_OPTIONS,
      ...options,
    };
  }

  async hash(plainPassword: string): Promise<string> {
    this.assertHashablePassword(plainPassword);

    const salt = randomBytes(this.options.saltLength).toString("base64url");
    const digest = await scryptAsync(plainPassword, salt, this.options.keyLength, {
      blockSize: this.options.blockSize,
      cost: this.options.cost,
      maxmem: this.options.maxmem,
      parallelization: this.options.parallelization,
    });

    return [
      HASH_PREFIX,
      this.options.cost,
      this.options.blockSize,
      this.options.parallelization,
      this.options.keyLength,
      salt,
      digest.toString("base64url"),
    ].join("$");
  }

  async verify(plainPassword: string, encodedHash: string): Promise<boolean> {
    if (!plainPassword || !encodedHash) {
      return false;
    }

    const parsed = this.parseHash(encodedHash);

    if (!parsed) {
      return false;
    }

    const candidate = await scryptAsync(
      plainPassword,
      parsed.salt,
      parsed.keyLength,
      parsed.options,
    );

    return candidate.length === parsed.digest.length && timingSafeEqual(candidate, parsed.digest);
  }

  private assertHashablePassword(plainPassword: string): void {
    if (!plainPassword) {
      throw new PasswordHashingError("Password cannot be empty.");
    }
  }

  private parseHash(encodedHash: string): ParsedScryptHash | null {
    const [prefix, costRaw, blockSizeRaw, parallelizationRaw, keyLengthRaw, salt, digestRaw] =
      encodedHash.split("$");

    if (
      prefix !== HASH_PREFIX ||
      !costRaw ||
      !blockSizeRaw ||
      !parallelizationRaw ||
      !keyLengthRaw ||
      !salt
    ) {
      return null;
    }

    const cost = Number(costRaw);
    const blockSize = Number(blockSizeRaw);
    const parallelization = Number(parallelizationRaw);
    const keyLength = Number(keyLengthRaw);

    if (![cost, blockSize, parallelization, keyLength].every(Number.isSafeInteger)) {
      return null;
    }

    if (cost <= 1 || blockSize <= 0 || parallelization <= 0 || keyLength <= 0) {
      return null;
    }

    try {
      const digest = Buffer.from(digestRaw ?? "", "base64url");

      if (digest.length !== keyLength) {
        return null;
      }

      return {
        digest,
        keyLength,
        options: {
          blockSize,
          cost,
          maxmem: this.options.maxmem,
          parallelization,
        },
        salt,
      };
    } catch {
      return null;
    }
  }
}
