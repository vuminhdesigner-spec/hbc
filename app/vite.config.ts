import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `--mode artifact` (W1) và `--mode motion` (trang demo chuyển động): gói cả trang vào một file HTML để đăng Artifact.
const SINGLE: Record<string, { outDir: string; input: string }> = {
  artifact: { outDir: 'dist-artifact', input: 'index.html' },
  motion: { outDir: 'dist-motion', input: 'motion.html' },
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), ...(SINGLE[mode] ? [viteSingleFile()] : [])],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    // prototype.css nạp tokens/v2-glass/theme.css ở thư mục cha
    fs: { allow: ['..'] },
  },
  build: SINGLE[mode]
    ? { outDir: SINGLE[mode].outDir, assetsInlineLimit: Infinity, rollupOptions: { input: SINGLE[mode].input } }
    : {},
}))
