
const _fs = require('fs');
const _path = require('path');
const dotenv = require('dotenv');

// Load .env
dotenv.config();

const REQUIRED = [
    'NODE_ENV',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'DATABASE_URL',
    'REDIS_URL',
    'PAYSTACK_SECRET_KEY',
    'YOUVERIFY_API_KEY',
    'RESEND_API_KEY'
];

console.log('--- Environment Validation ---');
const missing = [];
REQUIRED.forEach(key => {
    if (!process.env[key]) {
        console.error(`[MISSING] ${key}`);
        missing.push(key);
    } else {
        console.log(`[OK] ${key} is set.`);
    }
});

if (missing.length > 0) {
    console.error(`\nValidation FAILED. Missing ${missing.length} variables.`);
    process.exit(1);
} else {
    console.log('\nValidation PASSED.');
}
