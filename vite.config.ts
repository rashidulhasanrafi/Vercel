import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, path.resolve(), '');
  
  // Prioritize system environment variable (Netlify) over .env file
  const apiKey = process.env.API_KEY || env.API_KEY;

  return {
    plugins: [react()],
    resolve: {
      // Removed '@' alias to prevent "Failed to resolve module specifier" errors in some environments.
      // All imports should be relative (e.g., './components/...')
      alias: {},
    },
    define: {
      'process.env.API_KEY': JSON.stringify(apiKey || ''),
    },
    build: {
      outDir: 'dist',
    }
  };
});