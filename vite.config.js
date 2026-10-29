import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Mode « preview » : build autonome (chemins relatifs + routes en #) pour une préversion
// hébergée sans serveur. Le build normal utilise des URL propres (/boutique, /produit/...).
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'preview' ? './' : '/',
  server: {
    proxy: { '/api': 'http://localhost:3000', '/uploads': 'http://localhost:3000' }
  },
  build: { chunkSizeWarningLimit: 600 }
}))
