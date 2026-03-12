import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{js,ts,jsx,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      reportsDirectory: "./coverage",
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70,
      },
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/node_modules/**",
      ],
    },
    mockReset: true,
    restoreMocks: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@vayva/db": path.resolve(__dirname, "../../platform/infra/db/src/client.ts"),
      "@vayva/shared": path.resolve(__dirname, "../../packages/shared/utils/src/index.ts"),
      "@vayva/ui": path.resolve(__dirname, "../../packages/ui/src/index.ts"),
      "@vayva/schemas": path.resolve(__dirname, "../../packages/shared/schemas/src/index.ts"),
      "@vayva/compliance": path.resolve(__dirname, "../../packages/compliance/src/index.ts"),
      "@vayva/payments": path.resolve(__dirname, "../../packages/domain/payments/src/index.ts"),
      "@vayva/api-client": path.resolve(__dirname, "../../packages/shared/api-client/src/index.ts"),
      "@vayva/emails": path.resolve(__dirname, "../../packages/shared/emails/src/index.ts"),
    },
  },
});
