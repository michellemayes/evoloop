import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node', // Trigger scripts run in Node.js, not browser
    globals: true,
    setupFiles: ['./trigger/__tests__/setup.ts'],
    include: ['trigger/__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['trigger/**/*.ts'],
      exclude: ['trigger/__tests__/', 'node_modules/'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
