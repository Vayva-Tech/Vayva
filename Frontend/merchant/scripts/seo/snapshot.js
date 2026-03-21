// scripts/seo/snapshot.js
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
// Fallback for older node versions, though Next.js 13+ usually implies Node 18+ (with global fetch)
const fetch = global.fetch || ((...args) => import("node-fetch").then(({ default: f }) => f(...args)));

const { SITE_ORIGIN } = require("./config");

const OUT_DIR = path.join(process.cwd(), "seo");
const PUBLIC_DIR = path.join(process.cwd(), "public");
const MANIFEST_PATH = path.join(OUT_DIR, "manifest.json");
const SITEMAP_PATH = path.join(PUBLIC_DIR, "sitemap.xml");
const ROBOTS_PATH = path.join(PUBLIC_DIR, "robots.txt");

function ensureDir(p) {
    fs.mkdirSync(p, { recursive: true });
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

function xmlEscape(s) {
    return String(s)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&apos;");
}

function buildSitemap(manifest) {
    const urls = manifest
        .filter((r) => r && r.indexable === true && typeof r.canonical === "string")
        .map((r) => r.canonical);

    const unique = Array.from(new Set(urls)).sort();

    const items = unique
        .map((loc) => `  <url><loc>${xmlEscape(loc)}</loc></url>`)
        .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        `${items}\n` +
        `</urlset>\n`;
}

function buildRobotsTxt() {
    // Keep robots simple + strict.
    return [
        "User-agent: *",
        "Disallow: /api",
        "Disallow: /admin",
        "Disallow: /auth",
        "Disallow: /login",
        "Disallow: /dashboard",
        "Disallow: /onboarding",
        "Disallow: /preview",
        "Disallow: /designer",
        "Disallow: /control-center",
        "Disallow: /ops",
        "Disallow: /invite",
        "Disallow: /market/cart",
        "Disallow: /market/checkout",
        "Disallow: /market/order-confirmation",
        `Sitemap: ${SITE_ORIGIN}/sitemap.xml`,
        "",
    ].join("\n");
}

async function waitForServer(url, tries = 40) {
    for (let i = 0; i < tries; i++) {
        try {
            const res = await fetch(url, { headers: { "Accept": "application/json" } });
            if (res.ok) return;
        } catch (_error) {
            // Ignore temporary connection failures
        }
        await sleep(250);
    }
    throw new Error(`Server did not become ready: ${url}`);
}

async function main() {
    ensureDir(OUT_DIR);
    ensureDir(PUBLIC_DIR);

    // Start server
    const port = process.env.SEO_SNAPSHOT_PORT || "3107";
    const base = `http://127.0.0.1:${port}`;
    const manifestUrl = `${base}/api/__seo/manifest`;

    // Note: we use 'npx next start' as it expects a built app. 
    // For local dev testing, user might need to build first.
    const server = spawn("npx", ["next", "start", "-p", port], {
        stdio: "inherit",
        env: { ...process.env, NODE_ENV: "production" },
    });

    try {
        await waitForServer(manifestUrl);

        const res = await fetch(manifestUrl, { headers: { "Accept": "application/json" } });
        if (!res.ok) throw new Error(`Manifest fetch failed: ${res.status}`);

        const manifest = await res.json();
        if (!Array.isArray(manifest)) throw new Error("Manifest is not an array.");

        fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), "utf8");

        const sitemap = buildSitemap(manifest);
        fs.writeFileSync(SITEMAP_PATH, sitemap, "utf8");

        const robots = buildRobotsTxt();
        fs.writeFileSync(ROBOTS_PATH, robots, "utf8");

        console.log(`Wrote ${MANIFEST_PATH}`);
        console.log(`Wrote ${SITEMAP_PATH}`);
        console.log(`Wrote ${ROBOTS_PATH}`);
    } finally {
        server.kill("SIGTERM");
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
