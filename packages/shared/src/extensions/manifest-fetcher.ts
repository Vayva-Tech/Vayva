import { ExtensionManifest } from "./types";

/**
 * Fetches an external extension manifest from a URL and validates its structure.
 */
export async function fetchAndValidateManifest(url: string): Promise<ExtensionManifest> {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'User-Agent': 'Vayva-Platform-Sync/1.0'
        },
        cache: 'no-store'
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch manifest from ${url}: ${response.statusText}`);
    }

    const manifest = await response.json();

    // Basic structure validation
    const requiredFields = ['id', 'name', 'version', 'category'];
    for (const field of requiredFields) {
        if (!manifest[field]) {
            throw new Error(`Invalid manifest: Missing required field "${field}"`);
        }
    }

    return manifest as ExtensionManifest;
}
