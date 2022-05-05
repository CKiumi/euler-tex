/// <reference types="vitest" />
import { defineConfig, UserConfigExport } from "vite";
import path from "path";

export default defineConfig({
  test: {
    environment: "happy-dom",
  },
  alias: {
    src: path.resolve("src/"),
  },
} as UserConfigExport);
