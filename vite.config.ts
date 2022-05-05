/// <reference types="vitest" />
import { defineConfig, UserConfigExport } from "vite";
import { configDefaults } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "happy-dom",
    exclude: [...configDefaults.exclude, "test/e2e/*"],
  },
  alias: {
    src: path.resolve("src/"),
  },
} as UserConfigExport);
