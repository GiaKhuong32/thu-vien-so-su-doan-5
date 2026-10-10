import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'thuvienso-public',
    emptyOutDir: false,
    target: 'chrome70',
    cssTarget: 'chrome70',
    sourcemap: false,
    modulePreload: false,
  },
})
