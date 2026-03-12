
import { prisma } from '@vayva/db';

async function main() {
    try {
        const columns = await prisma.$queryRaw`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'Store'
      ORDER BY column_name;
    `;
        console.log("Store Table Columns:");
        console.log(JSON.stringify(columns, null, 2));
    } catch (e) {
        console.error("Error querying information_schema:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
