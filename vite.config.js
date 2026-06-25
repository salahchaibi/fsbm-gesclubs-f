import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const backendUrl = process.env.BACKEND_URL || env.BACKEND_URL || ""

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    define: {
      BACKEND_URL: JSON.stringify(backendUrl),
    },
  }
})
