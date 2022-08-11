/// <reference types="vitest" />
/// <reference types="vite/client" />
import { defineConfig, UserConfigExport } from "vite";
import { configDefaults } from "vitest/config";

export default defineConfig({
  root: "page",
  test: {
    environment: "happy-dom",
    exclude: [...configDefaults.exclude, "test/e2e/*"],
    coverage: { reportsDirectory: "test/coverage" },
  },
} as UserConfigExport);
