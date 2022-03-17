import { defineConfig } from 'vite'
import { createVuePlugin } from '../dist'

const config = defineConfig({
  resolve: {
    alias: {
      '/@': __dirname,
    },
  },
  build: {
    sourcemap: true,
    minify: false,
  },
  plugins: [
    createVuePlugin({ jsx: true }) as any,
  ],
})

export default config
