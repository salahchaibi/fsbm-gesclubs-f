import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = env.BACKEND_URL || 'http://backend'
  const appUrl = (process.env.APP_URL || env.APP_URL || '').replace(/\/$/, '')

  return {
    plugins: [react(), tailwindcss()],
    define: {
      BACKEND_URL: 'window.location.origin',
      APP_URL: appUrl ? JSON.stringify(appUrl) : 'window.location.origin',
    },
    server: {
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
        },
        '/storage': {
          target: backendUrl,
          changeOrigin: true,
        },
      },
    },
  }
})
