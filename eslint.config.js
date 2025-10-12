import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import pluginTypeScript from '@typescript-eslint/eslint-plugin'
import parserTypeScript from '@typescript-eslint/parser'
import parserVue from 'vue-eslint-parser'
import eslintConfigPrettier from 'eslint-config-prettier'

const commonLanguageOptions = {
  ecmaVersion: 'latest',
  sourceType: 'module',
  globals: {
    console: 'readonly',
    document: 'readonly',
    navigator: 'readonly',
    window: 'readonly',
    process: 'readonly'
  }
}

const baseRules = {
  'no-console': ['warn', { allow: ['warn', 'error'] }],
  'no-debugger': 'error',
  'no-var': 'error',
  'prefer-const': 'error'
}

const tsFiles = ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts', '**/*.d.ts']
const jsFiles = ['**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs']
const vueFiles = ['**/*.vue']

const tsConfigs = pluginTypeScript.configs['flat/recommended'].map((config) => ({
  ...config,
  files: tsFiles,
  languageOptions: {
    ...commonLanguageOptions,
    ...(config.languageOptions ?? {}),
    parser: parserTypeScript,
    parserOptions: {
      ...(config.languageOptions?.parserOptions ?? {}),
      ecmaVersion: 'latest',
      sourceType: 'module'
    }
  },
  rules: {
    ...(config.rules ?? {}),
    ...baseRules
  }
}))

const vueConfigs = pluginVue.configs['flat/recommended'].map((config) => ({
  ...config,
  files: vueFiles,
  languageOptions: {
    ...commonLanguageOptions,
    ...(config.languageOptions ?? {}),
    parser: parserVue,
    parserOptions: {
      ...(config.languageOptions?.parserOptions ?? {}),
      parser: parserTypeScript,
      ecmaVersion: 'latest',
      sourceType: 'module'
    }
  },
  rules: {
    ...(config.rules ?? {}),
    ...baseRules
  }
}))

export default [
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.vite/**', '**/coverage/**']
  },
  {
    ...js.configs.recommended,
    files: jsFiles,
    languageOptions: {
      ...commonLanguageOptions,
      ...(js.configs.recommended.languageOptions ?? {}),
      parserOptions: {
        ...(js.configs.recommended.languageOptions?.parserOptions ?? {}),
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    rules: {
      ...(js.configs.recommended.rules ?? {}),
      ...baseRules
    }
  },
  ...tsConfigs,
  ...vueConfigs,
  eslintConfigPrettier
]
