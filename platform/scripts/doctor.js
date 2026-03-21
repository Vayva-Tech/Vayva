import fs from 'fs';
import path from 'path';
import net from 'net';

const APPS = [
    { name: 'Merchant Admin', port: 3000 },
    { name: 'Storefront', port: 3001 },
    { name: 'Ops Console', port: 3002 },
    { name: 'Marketing', port: 3003 },
    { name: 'Marketplace', port: 3004 }
];

const CRITICAL_ENV_VARS = [
    'DATABASE_URL',
    'JWT_SECRET',
    'NEXTAUTH_SECRET',
    'NEXT_PUBLIC_API_URL',
    'RESEND_API_KEY',
    'GROQ_MARKETING_KEY',
    'GROQ_ADMIN_KEY',
    'GROQ_WHATSAPP_KEY'
];

console.log('\x1b[1m\x1b[36m%s\x1b[0m', '🩺 Vayva Doctor: Checking System Health...\n');

let issues = 0;

// 1. Check Configuration
console.log('\x1b[1m%s\x1b[0m', '1. Configuration & Environments');
const envPath = path.join(__dirname, '..', '.env');
const sampleEnvPath = path.join(__dirname, '..', '.env.example');

if (fs.existsSync(envPath)) {
    console.log('✅ .env file found');
} else if (fs.existsSync(sampleEnvPath)) {
    console.log('⚠️  .env file missing (Using .env.example or defaults)');
} else {
    console.log('❌ .env file missing');
    issues++;
}

const nvmrcPath = path.join(__dirname, '..', '.nvmrc');
if (fs.existsSync(nvmrcPath)) {
    console.log('✅ .nvmrc file found');
} else {
    console.log('⚠️  .nvmrc file missing');
}

// Check for missing critical env vars in .env (if it exists)
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    CRITICAL_ENV_VARS.forEach(varName => {
        if (!envContent.includes(`${varName}=`) || envContent.includes(`${varName}=""`)) {
            console.log(`⚠️  Critical env var ${varName} might be missing or empty in .env`);
        }
    });
}

// 2. Check Node Version
console.log('\n\x1b[1m%s\x1b[0m', '2. Node.js Environment');
const nodeVersion = process.version;
console.log(`ℹ️  Current Node Version: ${nodeVersion}`);
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion < 20) {
    console.log('❌ Node version must be >= 20.x');
    issues++;
} else {
    console.log('✅ Node version compatible');
}

// 3. Port Availability
console.log('\n\x1b[1m%s\x1b[0m', '3. Port Availability');

const checkPort = (port, name) => {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.once('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.log(`⚠️  Port ${port} (${name}) is already in use.`);
            } else {
                console.log(`❌ Error checking port ${port}: ${err.message}`);
                issues++;
            }
            resolve();
        });
        server.once('listening', () => {
            console.log(`✅ Port ${port} (${name}) is available.`);
            server.close();
            resolve();
        });
        server.listen(port);
    });
};

const runPortChecks = async () => {
    for (const app of APPS) {
        await checkPort(app.port, app.name);
    }
};

(async () => {
    await runPortChecks();

    console.log('\n-----------------------------------');
    if (issues === 0) {
        console.log('\x1b[32m%s\x1b[0m', '✅ System looks healthy! You are ready to start.');
    } else {
        console.log('\x1b[31m%s\x1b[0m', `❌ Found ${issues} potential issue(s). Please review above.`);
    }
})();
