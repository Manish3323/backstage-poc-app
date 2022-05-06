import reactRefresh from '@vitejs/plugin-react-refresh'
import nodePolyfills from 'rollup-plugin-polyfill-node'
import { defineConfig } from 'vite'
// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 9000
  },
  base: `./`,
  build: {
    rollupOptions: {
      input: ['./index.html']
    }
  },
  plugins: [reactRefresh(), nodePolyfills( {
    include: ['stream']
  } )]
})
