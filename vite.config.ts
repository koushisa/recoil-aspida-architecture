import react from '@vitejs/plugin-react'
import AutoImport from 'unplugin-auto-import/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    open: true,
    cors: false,
  },
  plugins: [
    react(),
    tsconfigPaths(),
    AutoImport({
      include: [/\.[tj]sx?$/], // .ts, .tsx, .js, .jsx
      imports: ['react'],
      dts: './src/auto-imports.d.ts',
    }),
  ],
})
