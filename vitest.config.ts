import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "./apps/merchant-admin/src"),
      "@vayva/shared": resolve(__dirname, "./packages/shared/src"),
      "@vayva/db": resolve(__dirname, "./infra/db/src/client.ts"),
    },
  },
  test: {
    globals: true,
    environment: "node",
    exclude: ["**/e2e/**", "**/node_modules/**"],
  },
});
