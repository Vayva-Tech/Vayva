
if (process.env.NODE_ENV === "production") {
    console.error("❌ FATAL: This script must NEVER run in production. Aborting.");
    process.exit(1);
}

// Adjusting import to match project structure
// Assuming we can use ts-node or the file is transpiled. 
// If running node directly on js file, we need the js version of the client.
// Let's try to load the client from the likely built location or use the @prisma/client if properly installed.
// The error was "Cannot find module '@prisma/client'". This means it's not in the root node_modules or reachable.
// But infra/db/prisma/seed.ts worked (or was structured to work).
// seed.ts uses: const { prisma } = require("../src/client");
// Let's try to point to that relative to scripts/seed-stress.js
// scripts/ is at root. infra/ is at root.
// Path: ../infra/db/src/client
const { prisma } = require("../infra/db/src/client");


async function main() {
    console.log("🔥 Seeding Stress Test Data (10k Records)...");

    const storeId = "store_aa_fashion";

    // Batch Insert Orders
    const BATCH_SIZE = 1000;
    const TOTAL_ORDERS = 10000;

    for (let i = 0; i < TOTAL_ORDERS; i += BATCH_SIZE) {
        const orders = [];
        for (let j = 0; j < BATCH_SIZE; j++) {
            orders.push({
                id: `stress_order_${i + j}`,
                storeId,
                refCode: `STR-${i + j}`,
                orderNumber: `DLV-${90000 + i + j}`,
                subtotal: 5000,
                total: 5000,
                status: "DELIVERED",
                paymentStatus: "SUCCESS",
                customerEmail: `stress${i + j}@test.com`,
                fulfillmentStatus: "DELIVERED",
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        console.log(`   Pushing batch ${i} to ${i + BATCH_SIZE}...`);
        await prisma.order.createMany({
            data: orders,
            skipDuplicates: true
        });
    }

    console.log("✅ 10k Orders Seeded.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
