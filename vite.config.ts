/// <reference types="vitest" />
import { defineConfig, UserConfigExport } from "vite";

export default defineConfig({
  test: {
    environment: "happy-dom",
  },
} as UserConfigExport);
