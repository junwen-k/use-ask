import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      provider: 'v8',
    },
    typecheck: {
      enabled: true,
      tsconfig: './tsconfig.test.json',
    },
  },
});
