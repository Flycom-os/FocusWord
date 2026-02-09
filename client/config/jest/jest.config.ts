import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  clearMocks: true,
  coveragePathIgnorePatterns: ["\\\\node_modules\\\\"],
  moduleDirectories: ["node_modules", "src"],
  moduleFileExtensions: ["js", "mjs", "cjs", "jsx", "ts", "tsx", "json", "node"],
  modulePaths: ["<rootDir>/src"],
  testMatch: ["<rootDir>/src/**/*(*.)@(spec|test).[tj]s?(x)"],
  roots: ["<rootDir>/src"],
  rootDir: "../../",
  setupFilesAfterEnv: ["<rootDir>/config/jest/setupTests.ts"],
  moduleNameMapper: {
    // ...
    "^@/(.*)$": "<rootDir>/$1",
  },
};
export default createJestConfig(config);
