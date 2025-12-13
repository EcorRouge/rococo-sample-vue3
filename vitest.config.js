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
    },
    env: {
      VITE_API_BASE_URL: 'http://localhost:5001',
      VITE_MICROSOFT_CLIENT_ID: 'test-microsoft-client-id',
      VITE_GOOGLE_CLIENT_ID: 'test-google-client-id',
      VITE_SHOW_FUTURE: 'false'
    }
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, './src'),
      stores: path.resolve(__dirname, './src/stores'),
      config: path.resolve(__dirname, './src/config'),
      layouts: path.resolve(__dirname, './src/layouts'),
      pages: path.resolve(__dirname, './src/pages'),
      components: path.resolve(__dirname, './src/components'),
      '#q-app': path.resolve(__dirname, './.quasar'),
      '@': path.resolve(__dirname, './src')
    }
  }
})

