import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  eslint.configs.recommended,
  eslintPluginReact.configs.flat.recommended,
  eslintPluginReact.configs.flat['jsx-runtime'],
  eslintPluginReactHooks.configs.flat['recommended-latest'],
  tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'prettier/prettier': ['error'],
      'no-console': ['error', { allow: ['error'] }],
      // Prevent directly importing react as a lint rule
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ImportDeclaration[source.value="react"] ImportDefaultSpecifier',
          message:
            'Do not directly import React. Add specific named imports instead (`import { useState, FC } from "react"`).',
        },
        {
          selector: 'ImportDeclaration[source.value="react"] ImportNamespaceSpecifier',
          message:
            'Do not directly namespace import React (`import * as React`). Add specific named imports instead (`import { useState, FC } from "react"`).',
        },
      ],
    },
  },
);
