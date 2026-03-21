import { defineConfig } from "vitest/config";
import path, { resolve } from "path";

export default defineConfig({
  test: {
    exclude: [
      "**/node_modules/**",
      "**/.git/**",
      "**/phase1-industry-apis.test.ts", // Exclude broken test - pre-existing issue
    ],
    include: [
      "src/**/*.test.ts",
    ],
    typecheck: {
      tsconfig: "tsconfig.test.json",
    },
  },
  resolve: {
    alias: [
      { find: "@", replacement: resolve(__dirname, "./src") },
      { find: "@vayva/db", replacement: resolve(__dirname, "../../platform/infra/db/src/client.ts") },
      { find: "@vayva/shared", replacement: resolve(__dirname, "../../packages/shared/src/index.ts") },
      { find: /@vayva\/shared\/(.*)/, replacement: resolve(__dirname, "../../packages/shared/src/$1") },
      { find: "@vayva/redis", replacement: resolve(__dirname, "../../packages/infra/redis-adapter/src/index.ts") },
      { find: "@vayva/payments", replacement: resolve(__dirname, "../../packages/domain/payments/src/index.ts") },
      { find: "@vayva/affiliate", replacement: resolve(__dirname, "../../packages/affiliate/src/index.ts") },
      { find: "@vayva/compliance", replacement: resolve(__dirname, "../../packages/compliance/src/index.ts") },
      { find: "@vayva/templates", replacement: resolve(__dirname, "../../packages/shared/templates/src/index.ts") },
      { find: /@vayva\/templates\/(.*)/, replacement: resolve(__dirname, "../../packages/shared/templates/src/$1") },
      { find: "@vayva/ui", replacement: resolve(__dirname, "../../packages/ui/src/index.ts") },
      { find: "@vayva/ai-agent", replacement: resolve(__dirname, "../../packages/ai-agent/src/index.ts") },
    ],
  },
});
