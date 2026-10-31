import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/seo-browser', workers: 1, timeout: 120000,
  use: { baseURL: process.env.SEO_BASE_URL || 'http://127.0.0.1:4173', browserName: 'chromium', channel: 'chrome', viewport: { width: 390, height: 844 } },
  webServer: process.env.SEO_BASE_URL ? undefined : { command: 'npm run preview -- --host 127.0.0.1 --port 4173', url: 'http://127.0.0.1:4173', reuseExistingServer: true, timeout: 180000 },
});
