const https = require('http');

const _CONFIG = {
    BASE_URL: process.env.VAYVA_CANONICAL_ORIGIN || "https://vayva.ng",
};

const ENDPOINTS = [
    { name: 'Merchant Admin', url: 'http://localhost:3000/api/health' },

    { name: 'Storefront', url: 'http://localhost:3001/api/health' },
    { name: 'Ops Console', url: 'http://localhost:3002/api/health' },
    { name: 'Marketplace', url: 'http://localhost:3004/api/health' }
];

console.log('🔥 Vayva Smoke Test: Checking Application Health...\n');

let failed = 0;

const checkEndpoint = (app) => {
    return new Promise((resolve) => {
        const req = https.get(app.url, (res) => {
            if (res.statusCode === 200) {
                console.log(`✅ ${app.name} is UP(${res.statusCode})`);
            } else {
                console.log(`❌ ${app.name} returned status ${res.statusCode} `);
                failed++;
            }
            resolve();
        });

        req.on('error', (err) => {
            console.log(`❌ ${app.name} is DOWN(${err.message})`);
            failed++;
            resolve();
        });
    });
};

(async () => {
    // Note: This script assumes apps are running.
    // In CI, we would start them first.
    console.log('Note: Ensure "pnpm dev" is running in a separate terminal.\n');

    for (const app of ENDPOINTS) {
        await checkEndpoint(app);
    }

    if (failed > 0) {
        process.exit(1);
    }
})();
