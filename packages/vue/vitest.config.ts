import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [vue()],
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
    setupFiles: ["vitest-browser-vue"],
  },
});
