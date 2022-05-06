/// <reference types="vitest" />
/// <reference types="vite/client" />
import { defineConfig, UserConfigExport } from "vite";
import { configDefaults } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "happy-dom",
    exclude: [...configDefaults.exclude, "test/e2e/*"],
    coverage: { reportsDirectory: "test/coverage" },
  },
  resolve: {
    alias: {
      "/": path.resolve(__dirname),
    },
  },
} as UserConfigExport);
