import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite가 React의 JSX 문법과 빠른 새로고침을 처리하도록 설정합니다.
export default defineConfig({
  plugins: [react()],
});
