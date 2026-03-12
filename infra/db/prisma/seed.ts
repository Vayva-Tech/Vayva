import "dotenv/config";
import { prisma } from "../src/client";

async function main() {

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
