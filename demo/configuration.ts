import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'

export const rsbuild = defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: {
      index: './index.tsx', // TODO rendering.tsx
    },
    define: {
      'process.env.PUBLIC_URL': '"/"',
    },
  },
  html: {
    title: 'epic-router Demo with epic-jsx',
    favicon: '../logo.png',
  },
  tools: {
    rspack: {
      resolve: {
        alias: {
          react: 'epic-jsx',
          'react/jsx-runtime': 'epic-jsx',
          'react/jsx-dev-runtime': 'epic-jsx',
        },
      },
    },
  },
})

export const gitignore = 'bundle'
export const vscode = 'biome'
export const biome = {
  extends: 'recommended',
  linter: {
    rules: {
      style: {
        useComponentExportOnlyModules: 'off',
      },
      correctness: {
        noUndeclaredDependencies: 'off',
      },
    },
  },
  root: false,
}

export const typescript = {
  extends: 'web',
  files: ['index.tsx'],
  exclude: ['preact'],
}
