import { randomBytes } from 'crypto';

/**
 * Global setup for E2E tests
 * Runs once before all tests
 */
async function globalSetup() {
    console.log("🔧 Global E2E Test Setup");
    // Set consistent NEXTAUTH_SECRET for test environment
    // This ensures JWT tokens signed during test setup can be verified by the app
    if (!process.env.NEXTAUTH_SECRET) {
        process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || randomBytes(32).toString('hex');
    }
    console.log("✅ Test environment ready");
    // Note: Database connection and test users will be created per-test
    // to avoid conflicts between parallel test runs
}
export default globalSetup;
