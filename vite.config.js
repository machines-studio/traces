import { defineConfig, loadEnv } from 'vite'

import path from 'path'

// If a backend is needed, see https://vitejs.dev/guide/backend-integration.html

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    root: path.join(__dirname, 'src'),
    publicDir: path.join(__dirname, 'public'),
    envDir: path.join(__dirname),
    build: {
      outDir: path.join(__dirname, 'build'),
      rollupOptions: {
        input: {
          main: path.join(__dirname, 'src/index.html'),
          moderation: path.join(__dirname, 'src/moderation.html')
        }
      }
    },

    base: env.BASE || '/',

    define: {
      __VERSION__: JSON.stringify(process.env.npm_package_version)
    },

    plugins: [
      { // Replace index.jsx by test/test.jsx as entry in test mode
        name: 'html-inject-test',
        transformIndexHtml: html => mode === 'test' ? html.replace('/index.jsx', '/test/test.jsx') : html,
        config: () => ({
          resolve: {
            alias: { '/test': path.join(__dirname, 'test') }
          }
        })
      },
      { // Reload the page when a public/config*.json file changes, since they're fetched, not bundled
        name: 'config-json-live-reload',
        configureServer (server) {
          server.watcher.add(path.join(__dirname, 'public/config*.json'))
          server.watcher.on('change', file => {
            if (/\/config[^/]*\.json$/.test(file)) server.ws.send({ type: 'full-reload' })
          })
        }
      },
      { // Resolve extensionless paths like /moderation to moderation.html on navigation
        name: 'html-extension-fallback',
        configureServer (server) {
          server.middlewares.use((req, res, next) => {
            const url = req.url?.split('?')[0] ?? ''
            if (req.headers['sec-fetch-mode'] !== 'navigate') return next()
            if (url === '/' || path.extname(url)) return next()
            req.url = `${url}.html${req.url.slice(url.length)}`
            next()
          })
        }
      }
    ],

    server: {
      port: 8080,
      host: true,
      allowedHosts: ['.local']
    },

    css: {
      devSourcemap: true,
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use '/style/_helpers' as *;
            @use '/style/_app' as app;
            @use '/style/_animations' as animations;
            $env: ${mode};
          `
        }
      }
    },

    esbuild: {
      jsxInject: "import { h, Fragment } from '@tooooools/ui'",
      jsxFactory: 'h',
      jsxFragment: 'Fragment',
      minifyIdentifiers: false
    }
  }
})
