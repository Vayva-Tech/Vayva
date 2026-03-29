"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAndValidateManifest = fetchAndValidateManifest;
/**
 * Fetches an external extension manifest from a URL and validates its structure.
 */
async function fetchAndValidateManifest(url) {
    const response = await fetch(url, {
        method: "GET",
        headers: {
            Accept: "application/json",
            "User-Agent": "Vayva-Platform-Sync/1.0",
        },
        cache: "no-store",
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch manifest from ${url}: ${response.statusText}`);
    }
    const manifest = await response.json();
    // Basic structure validation
    const requiredFields = ["id", "name", "version", "category"];
    for (const field of requiredFields) {
        if (!manifest[field]) {
            throw new Error(`Invalid manifest: Missing required field "${field}"`);
        }
    }
    return manifest;
}
//# sourceMappingURL=manifest-fetcher.js.map