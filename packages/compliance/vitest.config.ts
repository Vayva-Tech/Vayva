import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "**/*.d.ts",
        "**/*.test.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@vayva/db": path.resolve(__dirname, "../db/src/index.ts"),
      "@vayva/shared": path.resolve(__dirname, "../shared/src/index.ts"),
    },
  },
});
