import build from '@hono/vite-build/cloudflare-pages'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import { defineConfig } from 'vite'

export default defineConfig({
  publicDir: 'public',
  plugins: [
    build({
      exclude: ['/*.png', '/*.jpg', '/*.gif', '/*.svg', '/static/*', '/templates/*']
    }),
    devServer({
      adapter,
      entry: 'src/index.tsx'
    })
  ]
})
