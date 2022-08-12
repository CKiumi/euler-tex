/// <reference types="vitest" />
/// <reference types="vite/client" />
import { defineConfig, UserConfigExport } from "vite";
import { configDefaults } from "vitest/config";

export default defineConfig({
  root: "page",
  test: {
    include: ["../test/unit/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    environment: "happy-dom",
    exclude: [...configDefaults.exclude, "test/e2e/*"],
    coverage: { reportsDirectory: "test/coverage" },
  },
} as UserConfigExport);
