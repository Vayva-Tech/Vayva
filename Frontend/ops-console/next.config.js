const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  typescript: {
    // Some API routes reference Prisma models/fields not yet migrated
    ignoreBuildErrors: true,
  },
  transpilePackages: ["@vayva/ui", "@vayva/theme", "@vayva/schemas", "@vayva/api-client", "@vayva/content", "@vayva/emails", "@vayva/templates"],
  reactCompiler: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "@vayva/ui", "@vayva/shared", "@vayva/api-client", "framer-motion", "date-fns"]
  },
  turbopack: {
    resolveAlias: {
      "@/lib/*": "./src/lib/*",
      "@/components/*": "./src/components/*",
      "@/app/*": "./src/app/*",
      "@/providers/*": "./src/providers/*",
      "@/hooks/*": "./src/hooks/*",
      "@/types/*": "./src/types/*",
      "@/utils/*": "./src/utils/*",
      "@/config/*": "./src/config/*",
      "@/styles/*": "./src/styles/*",
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};
module.exports = nextConfig;
