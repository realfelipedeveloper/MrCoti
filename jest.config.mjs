export default {
  clearMocks: true,
  collectCoverageFrom: ["apps/api/src/**/*.ts", "!apps/api/src/**/*.spec.ts"],
  roots: ["<rootDir>/apps/api/src"],
  testEnvironment: "node",
  testMatch: ["**/*.spec.ts"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
      },
    ],
  },
};
