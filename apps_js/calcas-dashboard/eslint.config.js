import js from '@eslint/js'
import checkFile from 'eslint-plugin-check-file'
import pluginLingui from 'eslint-plugin-lingui'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommendedTypeChecked, pluginLingui.configs['flat/recommended']],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      react,
      'check-file': checkFile,
    },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [{ name: 'lucide-react', message: 'Please use "import {Icon} from "@/components/ui/icon"' }],
        },
      ],
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      'check-file/filename-naming-convention': ['error', { 'src/*/*.{ts,tsx}': 'KEBAB_CASE' }, { ignoreMiddleExtensions: true }],
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      'react/prop-types': 'off',
      'lingui/no-expression-in-message': 'off', // eslint-plugin-lingui recommands to not use logic in translation keys, but documentation says it's ok so we deactivate this rule
    },
    settings: { react: { version: '19.0' } },
  },
  eslintPluginPrettierRecommended,
)
