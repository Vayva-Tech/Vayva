
import { prisma } from '@vayva/db';

async function main() {
    const TEST_PREFIX = 'DEBUG_' + Date.now();
    console.log("Attempting to create Store...");
    try {
        const store = await prisma.store.create({
            data: {
                name: `${TEST_PREFIX} Store`,
                slug: `${TEST_PREFIX}-store`,
            },
            select: { id: true }
        });
        console.log("Store created successfully:", store.id);
    } catch (e) {
        console.error("Store creation FAILED:");
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
