import { join } from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: [join(__dirname, './src/**/*.test.ts')],
    globalSetup: [join(__dirname, './globalSetup.ts')],
  },
});
