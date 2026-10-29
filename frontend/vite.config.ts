import path from 'node:path'

import react from '@vitejs/plugin-react'
import {defineConfig} from 'vitest/config'

/** @spec SPEC-NFR-2 - Stub CSS imports in Vitest */
function vitestCssStub() {
  return {
    name: 'vitest-css-stub',
    enforce: 'pre' as const,
    load(id: string) {
      if (id.endsWith('.css') || id.endsWith('.scss')) {
        return 'export default {}'
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), ...(process.env.VITEST ? [vitestCssStub()] : [])],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Public API: браузер → /api/v1/* → https://api.hockeynights.appard.tech/v1/*
      '/api': {
        target: 'https://api.hockeynights.appard.tech',
        changeOrigin: true,
        secure: true,
        rewrite: (requestPath) => requestPath.replace(/^\/api/, ''),
      },
    },
  },
  optimizeDeps: {
    include: ['lottie-react', 'lottie-web'],
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/test/**/*.spec.ts', 'src/test/**/*.spec.tsx'],
    css: true,
    // Локальный .env с VITE_API_MODE=backend не должен ломать mock-тесты
    env: {
      VITE_API_MODE: 'mock',
      VITE_BACKEND_URL: '/api/v1',
    },
    server: {
      deps: {
        inline: [/@gravity-ui\/.*/],
      },
    },
  },
})
