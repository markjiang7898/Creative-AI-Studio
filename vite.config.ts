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
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || ''),
        'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || ''),
        'import.meta.env.VITE_QIANWEN_API_KEY': JSON.stringify(env.QIANWEN_API_KEY || env.VITE_QIANWEN_API_KEY || ''),
        'import.meta.env.VITE_QIANWEN_BASE_URL': JSON.stringify(env.QIANWEN_BASE_URL || env.VITE_QIANWEN_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
