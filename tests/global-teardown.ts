/**
 * Global teardown for E2E tests
 * Runs once after all tests
 */

async function globalTeardown() {
  console.log("🧹 Global E2E Test Teardown");
  console.log("✅ Cleanup complete");

  // Note: Test data cleanup happens per-test in afterEach hooks
}

export default globalTeardown;
