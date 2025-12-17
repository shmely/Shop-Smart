import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.REACT_APP_BASE_URL': JSON.stringify(env.REACT_APP_BASE_URL),
      'process.env.AUTH_DOMAIN': JSON.stringify(env.AUTH_DOMAIN),
      'process.env.PROJECT_ID': JSON.stringify(env.PROJECT_ID),
      'process.env.STORAGE_BUCKET': JSON.stringify(env.STORAGE_BUCKET),
      'process.env.MESSAGING_SENDER_ID': JSON.stringify(env.MESSAGING_SENDER_ID),
      'process.env.APP_ID': JSON.stringify(env.APP_ID),
      'process.env.MEASUREMENT_ID': JSON.stringify(env.MEASUREMENT_ID),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      sourcemap: true
    }
  };
});
