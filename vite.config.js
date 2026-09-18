import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Backend the dev server proxies /api and /uploads to (production uses a relative
  // path through IIS instead — see src/lib/constants.js). Override per-developer via
  // VITE_DEV_BACKEND_TARGET in a .env.local file.
  const devBackendTarget = env.VITE_DEV_BACKEND_TARGET || 'https://192.168.10.79:8091';

  return {
    plugins: [react(), mkcert()],
    server: {
      host: true,
      port: 4040,
      cors: true,
      https: true,
      proxy: {
        '/api': {
          target: devBackendTarget,
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: devBackendTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
})
