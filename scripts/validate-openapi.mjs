import { readFileSync } from "node:fs";

const contractFiles = [
  "specs/001-saas-platform-foundation/contracts/openapi.json",
  "specs/002-mvp-local-first-slice/contracts/openapi.json",
];

const httpMethods = new Set(["get", "put", "post", "delete", "patch", "options", "head", "trace"]);

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`${path}: JSON inválido (${error.message})`, { cause: error });
  }
}

function walk(value, visit) {
  if (Array.isArray(value)) {
    for (const item of value) {
      walk(item, visit);
    }
    return;
  }

  if (value && typeof value === "object") {
    visit(value);
    for (const item of Object.values(value)) {
      walk(item, visit);
    }
  }
}

function resolveJsonPointer(document, ref) {
  if (!ref.startsWith("#/")) {
    return false;
  }

  let cursor = document;
  for (const rawPart of ref.slice(2).split("/")) {
    const part = rawPart.replaceAll("~1", "/").replaceAll("~0", "~");
    if (!cursor || typeof cursor !== "object" || !(part in cursor)) {
      return false;
    }
    cursor = cursor[part];
  }

  return true;
}

function validateOpenApi(path) {
  const document = readJson(path);
  const errors = [];

  if (typeof document.openapi !== "string" || !document.openapi.startsWith("3.")) {
    errors.push("campo `openapi` deve existir e iniciar com `3.`");
  }

  if (!document.info || typeof document.info.title !== "string") {
    errors.push("campo `info.title` obrigatório");
  }

  if (!document.paths || typeof document.paths !== "object") {
    errors.push("campo `paths` obrigatório");
  }

  let operationCount = 0;
  for (const pathItem of Object.values(document.paths ?? {})) {
    if (!pathItem || typeof pathItem !== "object") {
      continue;
    }

    for (const method of Object.keys(pathItem)) {
      if (httpMethods.has(method.toLowerCase())) {
        operationCount += 1;
      }
    }
  }

  if (operationCount === 0) {
    errors.push("contrato deve possuir ao menos uma operação HTTP");
  }

  const refs = [];
  walk(document, (node) => {
    if (typeof node.$ref === "string") {
      refs.push(node.$ref);
    }
  });

  for (const ref of refs) {
    if (!resolveJsonPointer(document, ref)) {
      errors.push(`$ref inválido: ${ref}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`${path}: ${errors.join("; ")}`);
  }

  return {
    operationCount,
    pathCount: Object.keys(document.paths ?? {}).length,
    refCount: refs.length,
  };
}

for (const path of contractFiles) {
  const result = validateOpenApi(path);
  process.stdout.write(
    `${path}: openapi=ok paths=${result.pathCount} ops=${result.operationCount} refs=${result.refCount}\n`,
  );
}
