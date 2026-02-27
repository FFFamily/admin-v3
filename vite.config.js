import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import path from 'node:path'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const baseApi = env.VITE_BASE_API || '/api'
  const proxyTarget = env.VITE_PROXY_TARGET

  return {
    css: {
      preprocessorOptions: {
        // Use Sass "modern" API to avoid Dart Sass legacy JS API deprecation warnings.
        scss: { api: 'modern-compiler' }
      }
    },
    plugins: [
      vue(),
      createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), 'src/icons/svg')],
        symbolId: 'icon-[name]'
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      port: Number(env.VITE_PORT) || 5173,
      // Dev-only: use Vite proxy to avoid browser CORS when calling real backend.
      proxy: proxyTarget
        ? {
            [baseApi]: {
              target: proxyTarget,
              changeOrigin: true,
              secure: false,
              rewrite: p => p.replace(new RegExp(`^${escapeRegExp(baseApi)}`), '')
            }
          }
        : undefined
    }
  }
})
