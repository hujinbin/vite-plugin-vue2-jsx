import { defineConfig } from 'vite'
import langJsx from 'vite-plugin-lang-jsx'
import { createVuePlugin } from '../src'

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
    langJsx(),
    createVuePlugin({ jsx: true }) as any,
  ],
})

export default config
