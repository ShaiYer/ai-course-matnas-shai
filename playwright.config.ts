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
  // Assumes dev servers are already running via `npm run dev`
  // Run: npm run dev  (in one terminal)  then: npm run test:e2e
});
