// PM2 Configuration for Hono + Cloudflare Pages Development
module.exports = {
  apps: [
    {
      name: 'webapp',
      script: 'npx',
      args: 'wrangler pages dev dist --d1=shobodan-db --local --ip 0.0.0.0 --port 3000',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false, // Wrangler has its own hot reload
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
