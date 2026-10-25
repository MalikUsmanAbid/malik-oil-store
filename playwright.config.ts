import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser', workers: 1, timeout: 120000,
  use: { baseURL: 'http://127.0.0.1:3000', browserName: 'chromium', channel: 'chrome', viewport: { width: 390, height: 844 } },
  webServer: { command: 'npm run dev', url: 'http://127.0.0.1:3000/tests/cart.html', reuseExistingServer: true }
});
