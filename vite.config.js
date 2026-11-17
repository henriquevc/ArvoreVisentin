import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function localApiPlugin() {
  return {
    name: 'local-vercel-api-middleware',
    configureServer(server) {
      server.middlewares.use('/api/tree', async (req, res) => {
        // Reload .env on each dev request so edits to .env apply immediately
        const env = loadEnv(server.config.mode, process.cwd(), '')
        Object.assign(process.env, env)
        const { default: treeHandler } = await import('./api/tree.js')
        await treeHandler(req, res)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    localApiPlugin(),
  ],
})
