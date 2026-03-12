
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🏨 Starting Travel Verification...");

    // 1. Create a Dummy Travel Store
    const store = await prisma.store.create({
        data: {
            name: "Travel Test " + Date.now(),
            slug: "travel-test-" + Date.now(),
            category: "Travel",
            ownerId: "system_test_user_travel"
        }
    });

    // 2. Create Accommodation Product
    const product = await prisma.product.create({
        data: {
            storeId: store.id,
            title: "Presidential Suite",
            handle: "presidential-suite-" + Date.now(),
            price: 150000,
            metadata: {},
            AccommodationProduct: {
                create: {
                    type: "SUITE",
                    maxGuests: 4,
                    totalUnits: 5 // We have 5 suites
                }
            }
        },
        include: { AccommodationProduct: true }
    });

    console.log("✅ Created Product:", product.id, "Units:", product.AccommodationProduct?.totalUnits);

    // 3. Create Bookings (Conflicting)
    const today = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);

    // Book 3 units for tomorrow
    await prisma.booking.createMany({
        data: [1, 2, 3].map(() => ({
            serviceId: product.id,
            storeId: store.id,
            startsAt: today,
            endsAt: nextWeek, // Occupies the whole week
            status: "CONFIRMED"
        }))
    });

    console.log("✅ Created 3 Confirmed Bookings.");

    // 4. Check Availability Logic (Emulating API)
    const totalUnits = product.AccommodationProduct!.totalUnits;
    const bookedCount = await prisma.booking.count({
        where: {
            serviceId: product.id,
            status: "CONFIRMED",
            startsAt: { lt: tomorrow },
            endsAt: { gt: today }
        }
    });

    const available = totalUnits - bookedCount;
    console.log(`Availability Check: Total ${totalUnits} - Booked ${bookedCount} = ${available}`);

    if (available === 2) {
        console.log("🎉 Verification PASSED! Correctly calculated 2 rooms left.");
    } else {
        console.error(`❌ Verification FAILED! Expected 2, got ${available}`);
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
