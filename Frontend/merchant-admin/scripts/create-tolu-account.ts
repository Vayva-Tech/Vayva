import { prisma } from "../src/lib/prisma";
import * as bcrypt from "bcryptjs";

if (process.env.NODE_ENV === "production") {
  console.error(
    "❌ FATAL: This script must NEVER run in production. Aborting.",
  );
  process.exit(1);
}

async function createToluAccount() {
  console.log("🚀 Creating Tolu/Numba account...\n");

  try {
    // 1. Create Store
    console.log("📦 Creating store...");
    const store = await prisma.store.upsert({
      where: { slug: "numba-ventures" },
      update: {},
      create: {
        name: "Numba",
        slug: "numba-ventures",
        category: "fashion",
        industrySlug: "fashion",
        plan: "STARTER",
        isActive: true,
        onboardingCompleted: true,
        onboardingStatus: "COMPLETE",
        onboardingLastStep: "complete",
        settings: {
          tagline: "Streetwear Redefined",
          description: "Premium streetwear and lifestyle brand",
          brandColor: "#1a1a1a",
        },
        createdAt: new Date("2025-12-01T10:00:00Z"),
      },
    });
    console.log("✅ Store created:", store.slug);

    // 2. Create User
    console.log("\n👤 Creating user...");
    const hashedPassword = await bcrypt.hash("Numba2026!", 10);
    const user = await prisma.user.upsert({
      where: { email: "tolu@numba.store" },
      update: {},
      create: {
        email: "tolu@numba.store",
        password: hashedPassword,
        firstName: "Tolu",
        lastName: "Adeyemi",
        phone: "+2348123456789",
        isEmailVerified: true,
        isPhoneVerified: true,
        createdAt: new Date("2025-12-01T10:00:00Z"),
      },
    });
    console.log("✅ User created:", user.email);

    // 3. Create Role for this store
    console.log("\n🔑 Creating owner role...");
    const ownerRole = await prisma.role.upsert({
      where: {
        storeId_name: {
          storeId: store.id,
          name: "OWNER",
        },
      },
      update: {},
      create: {
        store: { connect: { id: store.id } },
        name: "OWNER",
        permissions: ["*"],
      },
    });
    console.log("✅ Role created");

    // 4. Create Membership
    console.log("\n🔗 Creating membership...");
    await prisma.storeMembership.upsert({
      where: {
        userId_storeId: {
          userId: user.id,
          storeId: store.id,
        },
      },
      update: {},
      create: {
        user: { connect: { id: user.id } },
        store: { connect: { id: store.id } },
        role: { connect: { id: ownerRole.id } },
        status: "active",
        joinedAt: new Date("2025-12-01T10:00:00Z"),
      },
    });
    console.log("✅ Membership created");

    // 5. Create Store Profile
    console.log("\n🏪 Creating store profile...");
    await prisma.storeProfile.upsert({
      where: { storeId: store.id },
      update: {},
      create: {
        store: { connect: { id: store.id } },
        slug: "numba-ventures",
        legalName: "Numba Ventures Limited",
        businessRegistrationNumber: "RC 1234567",
        addressLine1: "Suite 12, Block B, Landmark Towers",
        addressLine2: "15 Admiralty Way",
        city: "Lagos",
        state: "Lagos",
        postalCode: "101241",
        country: "NG",
        landmark: "Opposite Circle Mall",
      },
    });
    console.log("✅ Store profile created");

    // 6. Create Onboarding Record
    console.log("\n📋 Creating onboarding record...");
    await prisma.merchantOnboarding.upsert({
      where: { storeId: store.id },
      update: {},
      create: {
        store: { connect: { id: store.id } },
        status: "COMPLETE",
        currentStep: "complete",
        data: {
          identity: {
            fullName: "Tolu Adeyemi",
            phone: "+2348123456789",
          },
          business: {
            storeName: "Numba",
            legalName: "Numba Ventures Limited",
            phone: "+2348123456789",
            slug: "numba-ventures",
            country: "NG",
            state: "Lagos",
            city: "Lagos",
          },
          branding: {
            brandColor: "#1a1a1a",
          },
          finance: {
            bankCode: "058",
            bankName: "GTBank",
            accountNumber: "0123456789",
            accountName: "NUMBA VENTURES LIMITED",
          },
        },
        completedAt: new Date("2025-12-05T14:30:00Z"),
      },
    });
    console.log("✅ Onboarding completed");

    console.log("\n🎉 Account created successfully!\n");
    console.log("═══════════════════════════════════════");
    console.log("📧 LOGIN CREDENTIALS:");
    console.log("   Email: tolu@numba.store");
    console.log("   Password: Numba2026!");
    console.log("═══════════════════════════════════════");
    console.log("🏪 STORE:");
    console.log("   Name: Numba");
    console.log("   Slug: numba-ventures");
    console.log("   URL: http://localhost:3000/dashboard");
    console.log("═══════════════════════════════════════\n");

    return {
      success: true,
      storeId: store.id,
      userId: user.id,
      email: user.email,
    };
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    throw error;
  }
}

createToluAccount()
  .then(() => {
    console.log("✅ Script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
