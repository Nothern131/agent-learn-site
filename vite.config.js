import { defineConfig } from 'vite';

export default defineConfig({
  // 本地开发 base=/；GitHub Pages 部署时用 --base=/agent-learn-site/ 覆盖
  base: '/',
  server: {
    port: 5180,
    host: true,
  },
});
