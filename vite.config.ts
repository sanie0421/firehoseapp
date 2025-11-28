import build from '@hono/vite-build/cloudflare-pages'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import { defineConfig } from 'vite'

export default defineConfig({
  publicDir: 'public',
  plugins: [
    build({
      // Only exclude static files in root and specific directories
      // API routes like /api/images/* should go through the Worker
      exclude: ['/static/*', '/templates/*', '/icon.png', '/favicon.svg', '/*.png', '/kanagawa-logo.png', '/hose-icon.png', '/suisou-icon.png', '/task-icon.png', '/statistics-icon.png', '/members-icon.png', '/database-icon.png']
    }),
    devServer({
      adapter,
      entry: 'src/index.tsx'
    })
  ]
})
