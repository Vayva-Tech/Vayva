import { prisma } from "@vayva/db";
import { SCHEMA_MAP } from "@/lib/product-schemas";

async function main() {
  console.log("Starting productType backfill...");

  const params = {
    take: 100,
    skip: 0,
  };

  let hasMore = true;
  while (hasMore) {
    const products = await prisma.product.findMany({
      take: params.take,
      skip: params.skip,
      include: { store: true },
      where: { productType: null },
    });

    if (products.length === 0) {
      hasMore = false;
      break;
    }

    for (const product of products) {
      if (!product.store?.category) continue;

      const type = product.store.category; // Default to store category
      // Or map if necessary, e.g.
      // const type = product.store.category === 'Food' ? 'Food' : 'Retail';

      await prisma.product.update({
        where: { id: product.id },
        data: { productType: type },
      });
      console.log(`Updated product ${product.id} to type ${type}`);
    }

    params.skip += params.take;
  }

  console.log("Backfill complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
