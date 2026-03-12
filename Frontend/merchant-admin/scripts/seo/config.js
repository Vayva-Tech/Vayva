// scripts/seo/config.js
const SITE_ORIGIN = "https://vayva.ng";

// ✅ Indexable allow-list (ONLY these can be indexable)
const INDEX_ALLOW_PREFIXES = [
    "/about",
    "/blog",
    "/careers",
    "/community",
    "/compare",
    "/contact",
    "/features",
    "/help",
    "/how-vayva-works",
    "/legal",
    "/pricing",
    "/store-builder",
    "/templates",
    "/trust",
    "/market/categories",
    "/market/products",
    "/market/search",
    "/market/sellers",
    "/store",
];

// ❌ Hard noindex deny-list (must always be noindex, never in sitemap)
const HARD_NOINDEX_PREFIXES = [
    "/api",
    "/market/cart",
    "/market/checkout",
    "/market/order-confirmation",
    "/admin",
    "/auth",
    "/login",
    "/dashboard",
    "/onboarding",
    "/preview",
    "/designer",
    "/control-center",
    "/ops",
    "/invite",
];

// Duplicate marketplace route (marketing) rule
const DUP_MARKETING_MARKETPLACE_PATH = "/marketplace";
const CANONICAL_MARKETPLACE_TARGET = "/market/categories";

function startsWithPrefix(path, prefix) {
    return path === prefix || path.startsWith(prefix + "/");
}

function isHardNoindex(path) {
    return HARD_NOINDEX_PREFIXES.some((p) => startsWithPrefix(path, p));
}

function isAllowIndex(path) {
    if (path === "/") return true; // homepage
    return INDEX_ALLOW_PREFIXES.some((p) => startsWithPrefix(path, p));
}

function normalizeForCompare(str) {
    return String(str || "")
        .toLowerCase()
        .replace(/https?:\/\/[^/]+/g, "") // strip origins
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

function hasQuery(url) {
    try {
        return new URL(url).search.length > 0;
    } catch {
        return String(url).includes("?");
    }
}

module.exports = {
    SITE_ORIGIN,
    INDEX_ALLOW_PREFIXES,
    HARD_NOINDEX_PREFIXES,
    DUP_MARKETING_MARKETPLACE_PATH,
    CANONICAL_MARKETPLACE_TARGET,
    startsWithPrefix,
    isHardNoindex,
    isAllowIndex,
    normalizeForCompare,
    hasQuery,
};
