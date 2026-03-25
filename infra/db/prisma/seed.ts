import "dotenv/config";
import { prisma } from "../src/client";

/** Must match `FEATURE_FLAG_STARTER_FIRST_MONTH_FREE` in @vayva/shared */
const STARTER_FIRST_MONTH_FREE_KEY = "STARTER_FIRST_MONTH_FREE";

async function main() {
  await prisma.featureFlag.upsert({
    where: { key: STARTER_FIRST_MONTH_FREE_KEY },
    update: {
      description:
        "When ON: Starter first month free (~30 days, signup / no Paystack for monthly). When OFF: 7-day trial + paid Starter monthly checkout.",
    },
    create: {
      key: STARTER_FIRST_MONTH_FREE_KEY,
      description:
        "When ON: Starter first month free (~30 days, signup / no Paystack for monthly). When OFF: 7-day trial + paid Starter monthly checkout.",
      enabled: true,
      rules: {},
    },
  });
  console.log("Seed complete: STARTER_FIRST_MONTH_FREE feature flag upserted.");

  // ── 1. AI Plans (platform system data) ──────────────────────────
  const aiPlans = [
    { name: "STARTER", monthlyTokenLimit: 100_000, monthlyImageLimit: 50, monthlyRequestLimit: 20 },
    { name: "GROWTH",  monthlyTokenLimit: 500_000, monthlyImageLimit: 200, monthlyRequestLimit: 100 },
    { name: "SCALE",   monthlyTokenLimit: 2_000_000, monthlyImageLimit: 1000, monthlyRequestLimit: 500 },
  ];

  for (const plan of aiPlans) {
    await prisma.aiPlan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    });
  }

  console.log("Seed complete: AI plans seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
