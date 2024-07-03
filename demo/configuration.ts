import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'

export const rsbuild = defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: {
      index: './index.tsx',
    },
    define: {
      'process.env.PUBLIC_URL': '"/"',
    },
  },
  html: {
    title: 'epic-router Demo',
    favicon: '../logo.png',
  },
  output: {
    assetPrefix: '/',
  },
  tools: {
    rspack: {
      resolve: {
        alias: {
          react: 'preact/compat',
          'react-dom/test-utils': 'preact/test-utils',
          'react-dom': 'preact/compat',
          'react/jsx-runtime': 'preact/jsx-runtime',
          'react/jsx-dev-runtime': 'preact/jsx-dev-runtime',
        },
      },
    },
  },
})

export const gitignore = 'recommended'

export const typescript = {
  extends: 'web',
  files: ['index.tsx'],
}
