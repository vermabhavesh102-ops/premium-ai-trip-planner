import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy API to FastAPI dev server
      '/api': 'http://localhost:8000',
    },
  },
})

