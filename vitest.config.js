import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import path from 'path'

export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),
    quasar({
      sassVariables: 'src/css/quasar.variables.scss'
    })
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        'test/**',
        'tests/**',
        '**/*.spec.js',
        '**/*.test.js',
        '**/dist/**',
        'quasar.config.js',
        'postcss.config.js',
        'eslint.config.js',
        '.quasar/**'
      ]
    }
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, './src'),
      stores: path.resolve(__dirname, './src/stores'),
      '#q-app': path.resolve(__dirname, './.quasar')
    }
  }
})

