import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",

  rootDir: ".",

  moduleFileExtensions: ["js", "json", "ts"],
  testRegex: ".*\\.spec\\.ts$",

  collectCoverageFrom: ["**/*.(t|j)s"],
  coverageDirectory: "./coverage",

  moduleNameMapper: {
    "^src/(.*)$": "<rootDir>/src/$1",
    "^generated/(.*)$": "<rootDir>/generated/$1",
  },
};

export default config;
