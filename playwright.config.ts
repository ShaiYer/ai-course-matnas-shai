import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './playwright',
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // In CI (process.env.CI=true): always starts fresh servers
  // Locally: reuses already-running dev servers, starts them if not running
  webServer: [
    {
      command: 'npm run dev -w server',
      url: 'http://localhost:3001/api/events',
      reuseExistingServer: !process.env.CI,
      timeout: 20_000,
    },
    {
      command: 'npm run dev -w client',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 20_000,
    },
  ],
});
