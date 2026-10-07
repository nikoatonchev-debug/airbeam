import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// GitHub Pages serves the site from /airbeam/, so production builds use that base path.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/airbeam/' : '/',
  plugins: [react()],
}))
