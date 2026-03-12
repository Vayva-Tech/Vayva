
import { prisma } from '@vayva/db';

async function main() {
    console.log("⚠️  NUKING DATABASE (DROP SCHEMA public CASCADE)...");
    try {
        await prisma.$executeRawUnsafe('DROP SCHEMA public CASCADE;');
        await prisma.$executeRawUnsafe('CREATE SCHEMA public;');
        console.log("✅ DATABASE NUKED SUCCESSFULLY.");
    } catch (e) {
        console.error("❌ NUKE FAILED:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
