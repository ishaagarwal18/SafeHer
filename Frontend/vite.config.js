import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

<<<<<<< HEAD
export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
    // Proxy only real API calls — use exact path matching with /api/
    // and /dashboard/api/ so Vite's own HMR and asset requests are never
    // forwarded to Django by mistake on page refresh.
    proxy: {
      // All /api/* calls → Django
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
      // Only /dashboard/api/* and /dashboard/dashboard-data/ → Django
      // DO NOT proxy bare /dashboard or /dashboard/ — that causes Vite to
      // send the full-page refresh request to Django which returns HTML
      // instead of serving index.html, stripping all CSS/JS.
      '/dashboard/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
      '/dashboard/dashboard-data': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
=======
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
>>>>>>> dceb0a1555706ab72984b56d01e3aa17a60ebe8d
})
