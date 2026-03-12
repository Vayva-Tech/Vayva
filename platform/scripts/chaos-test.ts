if (process.env.NODE_ENV === "production") {
  console.error(
    "❌ FATAL: This script must NEVER run in production. Aborting.",
  );
  process.exit(1);
}

import {
  KillSwitchService,
  _KillSwitchFeature,
} from "../apps/merchant-admin/src/lib/ops/KillSwitch";
import { logger } from "../apps/merchant-admin/src/lib/logger";

// Mock Logger
logger.info = console.log;
logger.warn = console.log;
logger.error = console.error;

async function runChaos() {
  console.log("🔥 Starting Chaos Test Suite (Drill)...");

  const FEATURE_KEY = "CHAOS_TEST" as any; // Cast to bypass enum check for test
  const ENV_VAR_NAME = "KILL_SWITCH_CHAOS_TEST";

  // Test 1: Baseline (Should be enabled by default if no env var)
  // Note: This might try to hit FlagService -> Prisma.
  // If we want to strictly test Env Override, we should rely on the fact that Env check comes first.

  // Test 2: Hardware Switch (Env Var)
  console.log("\n🧪 Test: Hardware Kill Switch (Env Var)");
  console.log(`   Setting process.env.${ENV_VAR_NAME} = 'true'`);
  process.env[ENV_VAR_NAME] = "true";

  const isOperational =
    await KillSwitchService.isSystemOperational(FEATURE_KEY);

  if (isOperational === false) {
    console.log("   ✅ System correctly reports NON-OPERATIONAL (Killed).");
  } else {
    console.error("   ❌ System failed to kill the feature!");
    process.exit(1);
  }

  console.log("   Restoring Env Var...");
  delete process.env[ENV_VAR_NAME];

  console.log("\n✅ Kill Switch Drill Passed.");
}

runChaos().catch((e) => {
  console.error(e);
  process.exit(1);
});
