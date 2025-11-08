import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Get the backend URL from environment variable, fallback to localhost for development
// const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://xkcd-comic-subscription-production.up.railway.app',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist'
  }
})
