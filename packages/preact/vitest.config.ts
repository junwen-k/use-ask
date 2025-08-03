import { preact } from '@preact/preset-vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [preact()],
  test: {
    environment: 'happy-dom',
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
