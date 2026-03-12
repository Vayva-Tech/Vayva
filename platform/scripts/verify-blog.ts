import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("📰 Starting Blog Verification...");

  // 1. Create a Dummy Media Store
  const store = await prisma.store.create({
    data: {
      name: "The Daily Edit " + Date.now(),
      slug: "daily-edit-" + Date.now(),
      category: "Media",
      ownerId: "system_test_user_media",
    },
  });

  // 2. Create a Product to Tag
  const product = await prisma.product.create({
    data: {
      storeId: store.id,
      title: "Essential Desk Lamp",
      handle: "lamp-" + Date.now(),
      price: 12000,
      metadata: {},
    },
  });

  // 3. Create a Blog Post with Tagged Product
  const post = await prisma.blogPost.create({
    data: {
      storeId: store.id,
      title: "5 Lighting Tips",
      slug: "5-lighting-tips-" + Date.now(),
      content: "# Lighting matters...",
      status: "PUBLISHED",
      products: {
        create: {
          productId: product.id,
        },
      },
    },
    include: {
      products: {
        include: { product: true },
      },
    },
  });

  console.log("✅ Created Post:", post.title);
  console.log("Attached Products:", post.products.length);

  if (
    post.products.length === 1 &&
    post.products[0].product.title === "Essential Desk Lamp"
  ) {
    console.log("🎉 Verification PASSED! Product correctly tagged to Post.");
  } else {
    console.error("❌ Verification FAILED! Product not tagged.");
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
