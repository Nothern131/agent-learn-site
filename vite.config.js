import { defineConfig } from 'vite';

export default defineConfig({
  // GitHub Pages: base = /<repo-name>/
  // 本地开发时 base 为 / 不影响
  base: process.env.GITHUB_PAGES ? '/agent-learn-site/' : '/',
  server: {
    port: 5180,
    host: true,
  },
});
