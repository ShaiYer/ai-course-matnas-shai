import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.ts'],
    env: {
      DATABASE_URL: 'file:./prisma/test.db',
      NODE_ENV: 'test',
    },
    // Run test files sequentially to avoid DB race conditions
    fileParallelism: false,
  },
});
