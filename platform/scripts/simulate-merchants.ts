// import { PrismaClient } from "@prisma/client";
import { prisma } from "../infra/db/src/client";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";

if (process.env.NODE_ENV === "production") {
  console.error(
    "❌ FATAL: This script must NEVER run in production. Aborting.",
  );
  process.exit(1);
}

// const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting Multi-Tenant Simulation...");

  // 1. Retail Merchant (High Volume)
  await createMerchantScenario({
    slug: "megamart",
    name: "MegaMart Electronics",
    industry: "retail",
    email: "admin@megamart.com",
    productCount: 50,
    orderCount: 120,
    storeLive: true,
  });

  // 2. Restaurant (Food)
  await createMerchantScenario({
    slug: "spicybites",
    name: "Spicy Bites Bistro",
    industry: "food",
    email: "chef@spicybites.com",
    productCount: 20, // Menu items
    orderCount: 45,
    storeLive: true,
  });

  // 3. Service Provider (Consulting)
  await createMerchantScenario({
    slug: "legaleagles",
    name: "Legal Eagles LLP",
    industry: "services",
    email: "partner@legaleagles.com",
    productCount: 5, // Services
    orderCount: 12, // Bookings
    storeLive: false,
  });

  console.log("✅ Simulation Complete. Merchants data seeded.");
}

interface ScenarioConfig {
  slug: string;
  name: string;
  industry: string;
  email: string;
  productCount: number;
  orderCount: number;
  storeLive: boolean;
}

async function createMerchantScenario(config: ScenarioConfig) {
  console.log(`\nCreating Scenario: ${config.name} (${config.industry})...`);

  // 1. Create User & Store
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Cleanup existing user strictly
  try {
    const existingUsers = await prisma.user.findMany({
      where: { email: { equals: config.email, mode: "insensitive" } },
    });
    console.log(
      `  - Found ${existingUsers.length} existing users with email ${config.email}`,
    );
    if (existingUsers.length > 0) {
      for (const u of existingUsers) {
        // Delete memberships
        await prisma.membership.deleteMany({ where: { userId: u.id } });
        // Delete user
        await prisma.user.delete({ where: { id: u.id } });
      }
    }
    console.log(`  - Cleaned up any existing user with email ${config.email}`);
  } catch (e) {
    console.warn("  ! Cleanup warning:", e.message);
  }

  // Create Store first
  const store = await prisma.store.create({
    data: {
      name: config.name,
      slug: config.slug + "-" + faker.string.alphanumeric(4), // Ensure unique slug
      industrySlug: config.industry,
      isLive: config.storeLive,
      onboardingStatus: config.storeLive
        ? ("COMPLETE" as any)
        : ("IN_PROGRESS" as any),
      currency: "NGN",
      // country: "NG", // Removed as per schema
    },
  });

  // Create User linked to Store
  const _user = await prisma.user.create({
    data: {
      email: config.email,
      password: hashedPassword,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      // role: "MERCHANT", // Removed as it doesn't exist on User
      // storeId: store.id, // Removed as it doesn't exist on User (User <-> Membership <-> Store)
      memberships: {
        create: {
          storeId: store.id,
          role: "owner",
          role_enum: "OWNER" as any,
          status: "active",
        },
      },
      isEmailVerified: true,
    },
  });

  // Create Inventory Location
  const _location = await prisma.inventoryLocation.create({
    data: {
      storeId: store.id,
      name: "Main Location",
      isDefault: true,
    },
  });

  // 3. Seed Products
  console.log(`  - Seeding ${config.productCount} products...`);
  const products = [];
  for (let i = 0; i < config.productCount; i++) {
    const title =
      config.industry === "food"
        ? faker.food.dish()
        : faker.commerce.productName();
    const handle =
      title.toLowerCase().replace(/[^a-z0-9]+/g, "-") +
      "-" +
      faker.string.numeric(4); // Ensure uniqueness
    const price = parseFloat(faker.commerce.price());
    const sku = faker.string.alphanumeric(8).toUpperCase();

    const product = await prisma.product.create({
      data: {
        storeId: store.id,
        title: title,
        handle: handle,
        description: faker.commerce.productDescription(),
        price: price,
        status: "ACTIVE",
        sku: sku,
        ProductImage: {
          create: {
            url: faker.image.urlLoremFlickr({
              category: config.industry === "food" ? "food" : "business",
            }),
            position: 0,
          },
        },
        ProductVariant: {
          create: {
            title: "Default",
            options: {},
            price: price,
            sku: sku,

            // InventoryItem: {
            //     create: [{
            //         store: { connect: { id: store.id } },
            //         locationId: location.id,
            //         onHand: faker.number.int({ min: 10, max: 100 })
            //     }]
            // }
          },
        },
      },
    });
    products.push(product);
  }

  // 4. Seed Orders
  console.log(`  - Seeding ${config.orderCount} orders...`);
  for (let i = 0; i < config.orderCount; i++) {
    // Random product
    const randomProduct = products[Math.floor(Math.random() * products.length)];

    await prisma.order.create({
      data: {
        storeId: store.id,
        orderNumber: `#ORD-${faker.string.numeric(6)}`,
        status: "DELIVERED" as any,
        paymentStatus: "SUCCESS" as any,
        total: randomProduct.price, // total is required
        subtotal: randomProduct.price,
        // totalAmount: undefined, // removed
        refCode: faker.string.alphanumeric(12).toUpperCase(), // Added usage of specific unique fields
        customerEmail: faker.internet.email(),
        items: {
          create: {
            productId: randomProduct.id,
            title: randomProduct.title, // title is required on OrderItem
            quantity: 1,
            price: randomProduct.price,
          },
        },
      },
    });
  }

  console.log(
    `  ✅ Created ${config.name} with ${config.productCount} items and ${config.orderCount} orders.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
