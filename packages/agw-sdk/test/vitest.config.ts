import { join } from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globalSetup: [join(__dirname, './globalSetup.ts')],
  },
});
