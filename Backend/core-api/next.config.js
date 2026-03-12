/** @type {import('next').NextConfig} */
const { withSentryConfig } = require("@sentry/nextjs");
const path = require("path");

const nextConfig = {
    output: "standalone",
    transpilePackages: ["@vayva/ui", "@vayva/theme", "@vayva/schemas", "@vayva/shared", "@vayva/api-client", "@vayva/content", "@vayva/compliance", "@vayva/redis", "@vayva/emails", "@vayva/templates", "@vayva/ai-agent"],
    serverExternalPackages: ["@prisma/client", "@vayva/db", "bullmq", "ioredis", "pg", "jsdom", "isomorphic-dompurify"],
    reactCompiler: false,
    experimental: {
        optimizePackageImports: ["@phosphor-icons/react", "@vayva/ui", "@vayva/shared", "@vayva/api-client", "framer-motion", "recharts"],
    },
    images: {
        remotePatterns: [
            { protocol: "https", hostname: "res.cloudinary.com" },
            { protocol: "https", hostname: "images.unsplash.com" },
            { protocol: "https", hostname: "vayva.s3.amazonaws.com" },
            { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
        ],
    },
};

const withPWA = require("@ducanh2912/next-pwa").default({
    dest: "public",
    disable: true,
});

module.exports = withSentryConfig(
    withPWA(nextConfig),
    {
        silent: true,
    },
    {
        widenClientFileUpload: true,
        tunnelRoute: "/monitoring",
        hideSourceMaps: true,
        disableLogger: true,
    }
);
