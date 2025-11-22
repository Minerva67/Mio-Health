import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    server: {
      // Setup a proxy for local development (npm run dev)
      // This mimics what server.js does in production
      proxy: {
        '/api': {
          target: 'https://generativelanguage.googleapis.com',
          changeOrigin: true,
          rewrite: (path) => {
            // The Client SDK sends /api/v1beta/...
            // We want to forward to https://generativelanguage.googleapis.com/v1beta/...
            // And we need to inject the key locally
            const newPath = path.replace(/^\/api/, '');
            // For local dev, we append the key from local .env
            return `${newPath}${newPath.includes('?') ? '&' : '?'}key=${env.API_KEY || process.env.API_KEY}`;
          }
        }
      }
    },
    define: {
      // We don't need to expose API_KEY to the client anymore in production
      // But for consistency, we leave the logic clean
    }
  };
});