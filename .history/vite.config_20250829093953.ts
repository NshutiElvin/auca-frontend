import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Add these for production deployment
  base: './', // Critical for static file paths
  build: {
    outDir: 'dist',
    sourcemap: false, // Reduces build size
    emptyOutDir: true, // Clears dist folder before build
  },
  // Optional: Preview settings for testing production build
  preview: {
    port: 4173,
    strictPort: true,
  },
  // Optional: Environment variables
  define: {
    'process.env': {}
  }
})