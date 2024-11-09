import eslint from '@eslint/js';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintPluginSimpleImportSort from 'eslint-plugin-simple-import-sort';
import { createRequire } from 'module';
import tseslint from 'typescript-eslint';
const require = createRequire(import.meta.url);
const requireExtensions = require('eslint-plugin-require-extensions');

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.stylistic,
  ...tseslint.configs.strict,
  {
    plugins: {
      'simple-import-sort': eslintPluginSimpleImportSort,
      'require-extensions': requireExtensions,
      prettier: eslintPluginPrettier,
    },
    rules: {
      'prettier/prettier': 'error',
      'require-extensions/require-extensions': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn', // or "error"
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
  {
    ignores: ['node_modules/**', 'packages/**/dist/**'],
  },
);
