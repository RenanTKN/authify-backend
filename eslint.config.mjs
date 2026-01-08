// @ts-check
import eslint from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";
import tseslint from "typescript-eslint";
import * as importPlugin from "eslint-plugin-import";

export default tseslint.config(
  {
    ignores: ["eslint.config.mjs", "generated/**"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: "commonjs",
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/no-unsafe-argument": "warn",
      "import/no-relative-parent-imports": "warn",
      "import/no-useless-path-segments": "error",
      "import/no-cycle": ["error", { ignoreExternal: true }],
      "sort-keys": ["warn", "asc", { natural: true }],
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto",
          singleQuote: false,
          trailingComma: "all",
        },
      ],
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling", "index"],
          ],
          pathGroups: [
            {
              pattern: "@nestjs/**",
              group: "external",
              position: "before",
            },
            {
              pattern: "@prisma/**",
              group: "external",
              position: "after",
            },
            {
              pattern: "src/**",
              group: "internal",
              position: "after",
            },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
          "newlines-between": "always",
        },
      ],
    },
  },
  {
    files: ["**/*.module.ts", "src/config/**", "prisma.config.ts"],
    rules: {
      "sort-keys": "off",
    },
  },
);
