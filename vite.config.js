import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('.', import.meta.url))
const pages = ['index', 'programs', 'muharram', 'sunday-school', 'community', 'about', 'visit', 'donate']

export default defineConfig({
  server: { host: '0.0.0.0', allowedHosts: true },
  build: { rollupOptions: { input: Object.fromEntries(pages.map((p) => [p, resolve(root, `${p}.html`)])) } },
})
