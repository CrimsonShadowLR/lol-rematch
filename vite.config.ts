import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
}

export default defineConfig({
  plugins: [tailwindcss(), vue(), vueJsx(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/proxy/poro': {
        target: 'https://porofessor.gg',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/poro/, ''),
        headers: { ...BROWSER_HEADERS, Referer: 'https://porofessor.gg/' },
      },
      '/proxy/opgg': {
        target: 'https://op.gg',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/opgg/, ''),
        headers: { ...BROWSER_HEADERS, Referer: 'https://op.gg/', Origin: 'https://op.gg' },
      },
    },
  },
})
