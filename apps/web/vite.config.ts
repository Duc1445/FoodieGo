import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/vitest.setup.ts'],
    exclude: ['**/node_modules/**', 'e2e.test.ts', 'test-results/**'],
    // Use 'forks' pool: each test file runs in its own child process.
    // This ensures open handles (React Query polling intervals, pending promises)
    // do NOT prevent vitest from exiting after all tests complete.
    pool: 'forks',
    teardownTimeout: 3000,
  },
})
