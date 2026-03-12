import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "demo+e2e@vayva.test";
  const password = "TestPass123!";
  const hashedPassword = await bcrypt.hash(password, 10);
  const storeId = "store_tolu_01";
  const userId = "user_tolu_01";

  // 1. Clean up existing data for this test user
  try {
    if (!prisma.order) console.log("prisma.order is missing!");
    await prisma.order.deleteMany({ where: { storeId } });

    await prisma.wallet.deleteMany({ where: { storeId } });

    await prisma.membership.deleteMany({ where: { storeId } });

    await prisma.merchantSubscription.deleteMany({ where: { storeId } });

    await prisma.whatsappChannel.deleteMany({ where: { storeId } });

    await prisma.bankBeneficiary.deleteMany({ where: { storeId } });

    await prisma.store.deleteMany({ where: { id: storeId } });

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      await prisma.merchantSession.deleteMany({
        where: { userId: existingUser.id },
      });
      await prisma.membership.deleteMany({
        where: { userId: existingUser.id },
      });
      await prisma.user.delete({ where: { id: existingUser.id } });
    }
  } catch (e: unknown) {
    console.warn("Cleanup error:", e.message);
    console.warn("Stack:", e.stack);
  }

  // 2. Create User
  const user = await prisma.user.create({
    data: {
      id: userId,
      email,
      password: hashedPassword,
      firstName: "Tolu",
      lastName: "Merchant",
      isEmailVerified: true,
    },
  });

  // 3. Create Store
  const store = await prisma.store.create({
    data: {
      id: storeId,
      name: "Vayva Fashion Hub",
      isLive: true,
      onboardingStatus: "COMPLETE",
      slug: "vayva-fashion-hub",
    },
  });

  // 4. Create Membership
  await prisma.membership.create({
    data: {
      userId: user.id,
      storeId: store.id,
      role: "OWNER",
      status: "active",
    },
  });

  // 5. Create Subscription
  await prisma.merchantSubscription.create({
    data: {
      storeId: store.id,
      planSlug: "growth",
      status: "ACTIVE",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(new Date().setDate(new Date().getDate() + 30)),
    },
  });

  // 6. Create Wallet & KYC
  await prisma.wallet.create({
    data: {
      storeId: store.id,
      kycStatus: "VERIFIED",
      availableKobo: 45000000,
      pendingKobo: 1250000,
    },
  });

  // 7. Create WhatsApp Channel
  await prisma.whatsappChannel.create({
    data: {
      storeId: store.id,
      phoneNumberId: "phone_123",
      wabaId: "waba_123",
      status: "active",
      displayPhoneNumber: "+234 801 234 5678",
    },
  });

  // 8. Create Bank Beneficiary
  await prisma.bankBeneficiary.create({
    data: {
      storeId: store.id,
      bankCode: "058",
      bankName: "Guaranty Trust Bank",
      accountNumber: "1234567890",
      accountName: "Vayva Fashion Hub",
      isDefault: true,
    },
  });

  // 9. Seed Orders for Analytics
  const statuses: unknown[] = ["DELIVERED", "PROCESSING", "CANCELLED"];
  const paymentStatuses: unknown[] = ["SUCCESS", "PENDING", "FAILED"];

  for (let i = 0; i < 25; i++) {
    const daysAgo = Math.floor(Math.random() * 7);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    const amount = (Math.floor(Math.random() * 50) + 10) * 1000;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const payStatus =
      status === "DELIVERED"
        ? "SUCCESS"
        : paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
    const fulfillmentStatus =
      status === "DELIVERED" ? "DELIVERED" : "UNFULFILLED";

    await prisma.order.create({
      data: {
        storeId: store.id,
        refCode: `ORD-${Math.random().toString(36).substring(7).toUpperCase()}`,
        orderNumber: 1000 + i,
        status: status,
        paymentStatus: payStatus,
        fulfillmentStatus: fulfillmentStatus,
        total: amount,
        subtotal: amount,
        createdAt: date,
        currency: "NGN",
        customerEmail: `customer${i}@test.com`,
      },
    });
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
