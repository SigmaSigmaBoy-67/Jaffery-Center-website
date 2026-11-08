import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
const root = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': resolve(root, '.') } },
  server: { host: '0.0.0.0', allowedHosts: true },
  build: {
    rollupOptions: {
      input: Object.fromEntries(['index', 'about', 'community', 'programs', 'sunday-school', 'visit', 'donate'].map(name => [name, resolve(root, `${name}.html`)]))
    }
  }
})
