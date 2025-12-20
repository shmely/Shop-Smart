// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  // 1. Basic ESLint recommended rules
  eslint.configs.recommended,
  
  // 2. TypeScript-ESLint recommended rules
  ...tseslint.configs.recommended,
  
  // 3. Prettier config to disable formatting rules that conflict with ESLint
  prettier,
  
  // 4. Global ignores (replaces .eslintignore)
  {
    ignores: ["lib/**", "node_modules/**", ".eslintrc.js"],
  },
  
  // 5. Project-specific settings
  {
    files: ["**/*.ts", "**/*.mts", "**/*.cts"],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    },
  }
);