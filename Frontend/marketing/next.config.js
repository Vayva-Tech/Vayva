const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    outputFileTracingRoot: path.join(__dirname, '../../'),
    transpilePackages: ["@vayva/ui", "@vayva/shared"],
    turbopack: {},
    experimental: {
        optimizePackageImports: [
            "lucide-react",
            "@vayva/ui",
            "framer-motion",
            "date-fns",
            "@vayva/shared",
            "lodash"
        ],
        staleTimes: {
            dynamic: 60,
            static: 180,
        },
    },
    images: {
        formats: ["image/avif", "image/webp"],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 60,
        dangerouslyAllowSVG: false,
        contentDispositionType: "attachment",
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
        remotePatterns: [
            {
                protocol: "https",
                hostname: "randomuser.me",
            },
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
        ],
    },
    compress: true,
    productionBrowserSourceMaps: false,
    reactStrictMode: true,
    poweredByHeader: false,
    async redirects() {
        return [
            {
                source: "/vs/:competitor*",
                destination: "/compare/:competitor*",
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

const withPWA = require("@ducanh2912/next-pwa").default({
    dest: "public",
    disable: process.env.NODE_ENV === "development",
});

module.exports = withPWA(nextConfig);
