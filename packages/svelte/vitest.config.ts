import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [svelte()],
  test: {
    browser: {
      enabled: true,
      headless: true,
      screenshotFailures: false,
      provider: "playwright",
      instances: [{ browser: "chromium" }],
    },
    coverage: {
      enabled: true,
      provider: "v8",
    },
    typecheck: {
      enabled: true,
      tsconfig: "./tsconfig.test.json",
    },
    setupFiles: ["vitest-browser-svelte"],
  },
});
