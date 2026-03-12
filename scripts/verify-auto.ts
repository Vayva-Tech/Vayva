
import { prisma } from "../apps/merchant-admin/src/lib/prisma"; // Adjust import path if needed, or use @vayva/db
// Actually simpler to use @vayva/db directly if possible, or relative path to prisma client
// Let's assume we run this with ts-node and can import from @vayva/db or local prisma

// We can stick to standard script pattern
// import { PrismaClient } from '@prisma/client'
// const prisma = new PrismaClient()

// Given the monorepo structure, let's use the local db package approach if we can run it.
// Or just use the one in merchant-admin for simplicity of path.

// Let's try to find a valid prisma client import.
// Using relative path to infra/db/prisma/client if generated there?
// Or assume @vayva/db is linked.

// Creating a standalone script to run via `pnpm tsx`
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🚗 Starting Automotive Verification...");

    // 1. Create a Dummy Store (Automotive)
    const store = await prisma.store.create({
        data: {
            name: "Auto Test verify-auto-" + Date.now(),
            slug: "auto-test-" + Date.now(),
            category: "Automotive",
            ownerId: "system_test_user" // Mock
        }
    });
    console.log("✅ Created Store:", store.id);

    // 2. Create a Product with Vehicle Data
    const product = await prisma.product.create({
        data: {
            storeId: store.id,
            title: "2024 Toyota Camry XSE",
            handle: "toyota-camry-" + Date.now(),
            price: 45000,
            metadata: {},
            VehicleProduct: {
                create: {
                    make: "Toyota",
                    model: "Camry",
                    year: 2024,
                    vin: "TESTVIN123456789",
                    mileage: 10,
                    fuelType: "HYBRID",
                    transmission: "AUTOMATIC"
                }
            }
        },
        include: {
            VehicleProduct: true
        }
    });

    console.log("✅ Created Product with Vehicle:", product.id);
    console.log("Vehicle Data:", product.VehicleProduct);

    if (product.VehicleProduct?.make === "Toyota") {
        console.log("🎉 Verification PASSED!");
    } else {
        console.error("❌ Verification FAILED!");
        process.exit(1);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
