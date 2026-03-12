import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // 1. Create a Test Tenant/Store
  const store = await prisma.store.create({
    data: {
      name: "Vayva Demo Store",
      slug: "demo-store",
      settings: { currency: "NGN", timezone: "Africa/Lagos" },
    },
  });
  console.log(`Created store: ${store.name}`);

  // 2. Create Owner User
  const owner = await prisma.user.create({
    data: {
      email: "owner@vayva.ng",
      password: "$2a$10$EpIx.f.f.f.f", // "password" hash
      name: "Owner User",
      memberships: {
        create: {
          storeId: store.id,
          role: Role.OWNER,
        },
      },
    },
  });
  console.log(`Created owner: ${owner.email}`);

  // 3. Create Products
  const product = await prisma.product.create({
    data: {
      storeId: store.id,
      title: "Vayva T-Shirt",
      handle: "vayva-t-shirt",
      status: "ACTIVE",
      variants: {
        create: {
          title: "Default",
          price: 5000,
          inventory: 100,
        },
      },
    },
  });
  console.log(`Created product: ${product.title}`);

  console.log("✅ Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
