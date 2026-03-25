/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
    output: "standalone", // Ensures Vercel generates required .nft.json artifacts for middleware tracing
    transpilePackages: ["@vayva/ui", "@vayva/theme", "@vayva/schemas", "@vayva/shared", "@vayva/api-client", "@vayva/content", "@vayva/compliance", "@vayva/redis", "@vayva/emails", "@vayva/templates", "@vayva/industry-automotive", "@vayva/industry-core", "@vayva/industry-events", "@vayva/industry-grocery", "@vayva/industry-legal", "@vayva/industry-meal-kit", "@vayva/industry-nightlife", "@vayva/industry-nonprofit", "@vayva/industry-restaurant", "@vayva/industry-retail", "@vayva/industry-travel"],
    serverExternalPackages: ["@prisma/client", "@vayva/db", "bullmq", "ioredis", "pg", "jsdom", "isomorphic-dompurify", "puppeteer", "puppeteer-core", "chrome-aws-lambda", "cloudinary"],
    reactCompiler: false,
    experimental: {
        optimizePackageImports: ["@phosphor-icons/react", "@vayva/shared", "@vayva/api-client", "date-fns", "framer-motion", "recharts"],
        staleTimes: {
            dynamic: 30,
            static: 180,
        },
    },
    /* Removing absolute path root to fix CI/Turbopack error */
    // turbopack: {
    //     root: "/Users/fredrick/Documents/GitHub/vayva-platform"
    // },
    turbopack: {
        root: path.resolve(__dirname, "../.."),
    },
    webpack: (config, { isServer }) => {
        if (!isServer) {
            // Don't resolve server-only modules on the client
            config.resolve.fallback = {
                ...config.resolve.fallback,
                dns: false,
                net: false,
                tls: false,
                fs: false,
                child_process: false,
            };
        } else {
            // Exclude puppeteer and related modules from server bundle
            config.externals = [...(config.externals || []), 'puppeteer', 'puppeteer-core', 'chrome-aws-lambda', 'jsdom'];
        }
        return config;
    },
    images: {
        remotePatterns: [
            { protocol: "https", hostname: "res.cloudinary.com" },
            { protocol: "https", hostname: "images.unsplash.com" },
            { protocol: "https", hostname: "vayva.s3.amazonaws.com" },
            { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
        ],
    },
    async rewrites() {
        const rewrites = [];
        // Only proxy to external API if MERCHANT_API_URL is explicitly set
        if (process.env.MERCHANT_API_URL) {
            rewrites.push({
                source: "/api/auth/:path*",
                destination: "/api/auth/:path*",
            });
            rewrites.push({
                source: "/api/:path*",
                destination: `${process.env.MERCHANT_API_URL}/api/:path*`,
            });
        }
        if (process.env.OPS_CONSOLE_URL) {
            rewrites.push({
                source: "/ops/:path*",
                destination: `${process.env.OPS_CONSOLE_URL}/ops/:path*`,
            });
        }
        return rewrites;
    },
    async redirects() {
        return [
            {
                source: "/login",
                destination: "/signin",
                permanent: true,
            },
            {
                source: "/register",
                destination: "/signup",
                permanent: true,
            },
            {
                source: "/beta/meal-kit",
                destination: "/dashboard/meal-kit",
                permanent: true,
            },
            {
                source: "/dashboard/desktop-app",
                destination: "/beta/desktop-app",
                permanent: true,
            },
        ];
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
