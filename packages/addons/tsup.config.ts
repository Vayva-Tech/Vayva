import path from "node:path";
import { defineConfig } from "tsup";

/** Object keys → predictable `dist/<key>.{js,mjs}` paths for package.json `exports`. */
export default defineConfig({
  entry: {
    index: "src/index.ts",
    types: "src/types.ts",
    registry: "src/registry.ts",
    "mount-points": "src/mount-points/index.ts",
    "components/storefront": "src/components/storefront.tsx",
    "components/settings": "src/components/settings.tsx",
    "shopping-cart/index": "src/shopping-cart/index.tsx",
    "checkout-flow/index": "src/checkout-flow/index.tsx",
    "product-pages/index": "src/product-pages/index.tsx",
    "wishlist/index": "src/wishlist/index.tsx",
    "reviews/index": "src/reviews/index.tsx",
    "booking/index": "src/booking/index.tsx",
    "newsletter/index": "src/newsletter/index.tsx",
    "api/routes": "src/api/routes.ts",
  },
  format: ["cjs", "esm"],
  // Declaration emit pulls in settings/storefront + React / lucide friction; consumers
  // resolve types from `src/` via package.json `types` and tsconfig paths.
  dts: false,
  clean: true,
  external: ["react", "next", "framer-motion", "lucide-react", "date-fns"],
  esbuildOptions(options) {
    options.alias = {
      "@/lib/utils": path.resolve(__dirname, "src/lib/utils.ts"),
    };
  },
});
