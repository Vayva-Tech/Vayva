// scripts/seo/validate-robots.js
const fs = require("fs");
const { SITE_ORIGIN } = require("./config");

function fail(msg) {
    console.error(`SEO CI FAIL: ${msg}`);
    process.exit(1);
}

function ensure(cond, msg) {
    if (!cond) fail(msg);
}

function mustContain(text, line) {
    ensure(text.includes(line), `robots.txt missing line: ${line}`);
}

function main() {
    const robotsPath = process.argv[2] || "public/robots.txt";
    ensure(fs.existsSync(robotsPath), `Missing robots.txt: ${robotsPath}`);

    const robots = fs.readFileSync(robotsPath, "utf8");

    mustContain(robots, "User-agent: *");
    mustContain(robots, "Disallow: /api");
    mustContain(robots, "Disallow: /admin");
    mustContain(robots, "Disallow: /auth");
    mustContain(robots, "Disallow: /login");
    mustContain(robots, "Disallow: /dashboard");
    mustContain(robots, "Disallow: /onboarding");
    mustContain(robots, "Disallow: /preview");
    mustContain(robots, "Disallow: /designer");
    mustContain(robots, "Disallow: /control-center");
    mustContain(robots, "Disallow: /ops");
    mustContain(robots, "Disallow: /invite");

    // Checkout flow must be disallowed
    mustContain(robots, "Disallow: /market/cart");
    mustContain(robots, "Disallow: /market/checkout");
    mustContain(robots, "Disallow: /market/order-confirmation");

    // Sitemap link must be present and correct
    mustContain(robots, `Sitemap: ${SITE_ORIGIN}/sitemap.xml`);

    // Domain guard
    ensure(!robots.includes("vayva.com"), "robots.txt contains vayva.com");

    console.log("robots.txt validation passed.");
}

main();
