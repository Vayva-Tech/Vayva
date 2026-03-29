import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/client";

async function main() {
  const merchantPassword = "TestPass123!";
  const opsPassword = "TestPass123!";

  const [merchantHash, opsHash] = await Promise.all([
    bcrypt.hash(merchantPassword, 10),
    bcrypt.hash(opsPassword, 12),
  ]);

  // Merchant A
  const merchantAUser = await prisma.user.upsert({
    where: { email: "e2e-merchant-a@vayva.test" },
    update: {
      firstName: "E2E",
      lastName: "MerchantA",
      password: merchantHash,
      isEmailVerified: true,
    },
    create: {
      id: "e2e-user-a",
      email: "e2e-merchant-a@vayva.test",
      firstName: "E2E",
      lastName: "MerchantA",
      password: merchantHash,
      isEmailVerified: true,
    },
  });

  const storeA = await prisma.store.upsert({
    where: { slug: "e2e-store-a" },
    update: {
      name: "E2E Store A",
      onboardingCompleted: true,
      onboardingStatus: "COMPLETE",
      isLive: true,
    },
    create: {
      id: "e2e-store-a",
      name: "E2E Store A",
      slug: "e2e-store-a",
      onboardingCompleted: true,
      onboardingStatus: "COMPLETE",
      isLive: true,
    },
  });

  await prisma.membership.upsert({
    where: {
      userId_storeId: {
        userId: merchantAUser.id,
        storeId: storeA.id,
      },
    },
    update: {
      role: "owner",
      role_enum: "OWNER",
      status: "active",
    },
    create: {
      id: "e2e-membership-a",
      userId: merchantAUser.id,
      storeId: storeA.id,
      role: "owner",
      role_enum: "OWNER",
      status: "active",
    },
  });

  // Merchant B
  const merchantBUser = await prisma.user.upsert({
    where: { email: "e2e-merchant-b@vayva.test" },
    update: {
      firstName: "E2E",
      lastName: "MerchantB",
      password: merchantHash,
      isEmailVerified: true,
    },
    create: {
      id: "e2e-user-b",
      email: "e2e-merchant-b@vayva.test",
      firstName: "E2E",
      lastName: "MerchantB",
      password: merchantHash,
      isEmailVerified: true,
    },
  });

  const storeB = await prisma.store.upsert({
    where: { slug: "e2e-store-b" },
    update: {
      name: "E2E Store B",
      onboardingCompleted: true,
      onboardingStatus: "COMPLETE",
      isLive: true,
    },
    create: {
      id: "e2e-store-b",
      name: "E2E Store B",
      slug: "e2e-store-b",
      onboardingCompleted: true,
      onboardingStatus: "COMPLETE",
      isLive: true,
    },
  });

  await prisma.membership.upsert({
    where: {
      userId_storeId: {
        userId: merchantBUser.id,
        storeId: storeB.id,
      },
    },
    update: {
      role: "owner",
      role_enum: "OWNER",
      status: "active",
    },
    create: {
      id: "e2e-membership-b",
      userId: merchantBUser.id,
      storeId: storeB.id,
      role: "owner",
      role_enum: "OWNER",
      status: "active",
    },
  });

  await prisma.product.upsert({
    where: {
      storeId_handle: {
        storeId: storeA.id,
        handle: "e2e-product-a",
      },
    },
    update: {
      title: "E2E Product A",
      price: 1000,
      status: "ACTIVE",
      trackInventory: false,
    },
    create: {
      id: "11111111-1111-1111-1111-111111111111",
      storeId: storeA.id,
      title: "E2E Product A",
      description: "",
      handle: "e2e-product-a",
      status: "ACTIVE",
      price: 1000,
      trackInventory: false,
      allowBackorder: true,
      tags: [],
    },
  });

  // Ops owner (Ops Console)
  await prisma.opsUser.upsert({
    where: { email: "e2e-ops@vayva.test" },
    update: {
      name: "E2E Ops",
      role: "OPS_OWNER",
      password: opsHash,
      isActive: true,
    },
    create: {
      id: "e2e-ops-user",
      email: "e2e-ops@vayva.test",
      name: "E2E Ops",
      role: "OPS_OWNER",
      password: opsHash,
      isActive: true,
    },
  });

  console.log("E2E seed complete:");
  console.log("- Merchant A: e2e-merchant-a@vayva.test / TestPass123!");
  console.log("- Merchant B: e2e-merchant-b@vayva.test / TestPass123!");
  console.log("- Ops: e2e-ops@vayva.test / TestPass123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
