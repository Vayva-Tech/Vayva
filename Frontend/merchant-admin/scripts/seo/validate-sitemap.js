// scripts/seo/validate-sitemap.js
const fs = require("fs");
const { SITE_ORIGIN } = require("./config");

function fail(msg) {
    console.error(`SEO CI FAIL: ${msg}`);
    process.exit(1);
}

function ensure(cond, msg) {
    if (!cond) fail(msg);
}

function extractLocs(xml) {
    const locs = [];
    const re = /<loc>(.*?)<\/loc>/g;
    let m;
    while ((m = re.exec(xml))) locs.push(m[1]);
    return locs;
}

function main() {
    const sitemapPath = process.argv[2] || "public/sitemap.xml";
    const manifestPath = process.argv[3] || "seo/manifest.json";

    ensure(fs.existsSync(sitemapPath), `Missing sitemap: ${sitemapPath}`);
    ensure(fs.existsSync(manifestPath), `Missing manifest: ${manifestPath}`);

    const xml = fs.readFileSync(sitemapPath, "utf8");
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

    const sitemapLocs = new Set(extractLocs(xml));
    ensure(sitemapLocs.size > 0, "Sitemap has no <loc> entries.");

    // All sitemap URLs must use vayva.ng
    for (const loc of sitemapLocs) {
        ensure(loc.startsWith(SITE_ORIGIN), `Sitemap loc wrong origin: ${loc}`);
        ensure(!loc.includes("vayva.com"), `Sitemap loc contains vayva.com: ${loc}`);
        ensure(!loc.includes("?"), `Sitemap loc contains query params: ${loc}`);
    }

    const expected = new Set(
        manifest
            .filter((r) => r && r.indexable === true && typeof r.canonical === "string")
            .map((r) => r.canonical)
    );

    // Expected indexable canonicals must all be in sitemap
    for (const loc of expected) {
        ensure(sitemapLocs.has(loc), `Sitemap missing indexable canonical: ${loc}`);
    }

    // Sitemap must not contain non-indexable pages
    const nonIndexable = new Set(
        manifest
            .filter((r) => r && r.indexable !== true && typeof r.canonical === "string")
            .map((r) => r.canonical)
    );

    for (const loc of sitemapLocs) {
        if (nonIndexable.has(loc)) {
            fail(`Sitemap contains non-indexable canonical: ${loc}`);
        }
    }

    console.log("Sitemap validation passed.");
}

main();
