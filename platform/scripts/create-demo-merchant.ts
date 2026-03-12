import { PrismaClient } from "../infra/db/src/generated/client";
import * as bcrypt from "bcryptjs";

if (process.env.NODE_ENV === "production") {
  console.error(
    "❌ FATAL: This script must NEVER run in production. Aborting.",
  );
  process.exit(1);
}

const prisma = new PrismaClient();

async function createDemoMerchant() {
  console.log("🚀 Creating demo merchant: Tolu from Numba Ventures...");

  // Create Store
  const store = await prisma.store.create({
    data: {
      id: "store_numba_demo",
      name: "Numba",
      businessName: "Numba Ventures",
      slug: "numba-ventures",
      domain: "numba",
      category: "FASHION",
      description:
        "Premium streetwear and lifestyle brand offering curated collections of contemporary fashion, accessories, and lifestyle products for the modern Nigerian youth.",
      email: "hello@numba.store",
      phone: "+2348123456789",
      address: "15 Admiralty Way, Lekki Phase 1, Lagos",
      city: "Lagos",
      state: "Lagos",
      country: "Nigeria",
      currency: "NGN",
      timezone: "Africa/Lagos",
      logoUrl: "/logos/numba-logo.png",
      bannerUrl: "/banners/numba-banner.jpg",
      brandColor: "#1a1a1a",
      isActive: true,
      isPublished: true,
      onboardingCompleted: true,
      onboardingStep: "COMPLETED",
      plan: "STARTER",
      planStartedAt: new Date(),
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      features: {
        whatsapp: { enabled: true },
        socials: { enabled: true, instagramEnabled: true },
        dashboard: { v2: { enabled: true } },
        transactions: { enabled: true },
        ai: { enabled: true, customization: true },
      },
      settings: {
        notifications: { email: true, sms: true, whatsapp: true },
        orderAutoConfirm: true,
        lowStockThreshold: 5,
        currency: "NGN",
        taxRate: 0,
      },
      createdAt: new Date("2025-12-01"),
      updatedAt: new Date(),
    },
  });

  console.log("✅ Store created:", store.id);

  // Create Merchant User
  const hashedPassword = await bcrypt.hash("Numba2026!", 10);

  const merchant = await prisma.merchant.create({
    data: {
      id: "merchant_tolu_demo",
      storeId: store.id,
      email: "tolu@numba.store",
      password: hashedPassword,
      firstName: "Tolu",
      lastName: "Adeyemi",
      phone: "+2348123456789",
      role: "OWNER",
      isActive: true,
      emailVerified: true,
      phoneVerified: true,
      lastLoginAt: new Date(),
      createdAt: new Date("2025-12-01"),
      updatedAt: new Date(),
    },
  });

  console.log("✅ Merchant created:", merchant.email);

  // Create some sample products
  const products = await prisma.product.createMany({
    data: [
      {
        id: "prod_numba_001",
        storeId: store.id,
        name: "Oversized Graphic Tee - Black",
        slug: "oversized-graphic-tee-black",
        description:
          "Premium cotton oversized graphic tee with exclusive Numba artwork. Perfect for streetwear enthusiasts.",
        price: 15000,
        compareAtPrice: 20000,
        costPrice: 8000,
        sku: "NUMBA-TEE-BLK-001",
        barcode: "8901234567890",
        trackInventory: true,
        quantity: 45,
        lowStockThreshold: 10,
        category: "Clothing",
        tags: ["streetwear", "tee", "oversized", "black", "graphic"],
        images: ["/products/tee-black-1.jpg", "/products/tee-black-2.jpg"],
        isActive: true,
        isFeatured: true,
        weight: 250,
        dimensions: { length: 30, width: 25, height: 2 },
        createdAt: new Date("2025-12-05"),
        updatedAt: new Date(),
      },
      {
        id: "prod_numba_002",
        storeId: store.id,
        name: "Cargo Pants - Olive Green",
        slug: "cargo-pants-olive-green",
        description:
          "Tactical-inspired cargo pants with multiple pockets. Durable fabric perfect for everyday wear.",
        price: 28000,
        compareAtPrice: 35000,
        costPrice: 15000,
        sku: "NUMBA-CARGO-OLV-002",
        barcode: "8901234567891",
        trackInventory: true,
        quantity: 32,
        lowStockThreshold: 8,
        category: "Clothing",
        tags: ["pants", "cargo", "olive", "streetwear"],
        images: ["/products/cargo-olive-1.jpg"],
        isActive: true,
        isFeatured: true,
        weight: 450,
        dimensions: { length: 40, width: 30, height: 3 },
        createdAt: new Date("2025-12-08"),
        updatedAt: new Date(),
      },
      {
        id: "prod_numba_003",
        storeId: store.id,
        name: "Snapback Cap - Embroidered Logo",
        slug: "snapback-cap-embroidered",
        description:
          "Premium snapback with embroidered Numba logo. Adjustable fit, structured crown.",
        price: 12000,
        compareAtPrice: 15000,
        costPrice: 6000,
        sku: "NUMBA-CAP-BLK-003",
        barcode: "8901234567892",
        trackInventory: true,
        quantity: 68,
        lowStockThreshold: 15,
        category: "Accessories",
        tags: ["cap", "snapback", "accessories", "black"],
        images: ["/products/cap-black-1.jpg", "/products/cap-black-2.jpg"],
        isActive: true,
        isFeatured: false,
        weight: 150,
        dimensions: { length: 20, width: 20, height: 10 },
        createdAt: new Date("2025-12-10"),
        updatedAt: new Date(),
      },
      {
        id: "prod_numba_004",
        storeId: store.id,
        name: "Hoodie - Grey Melange",
        slug: "hoodie-grey-melange",
        description:
          "Heavyweight hoodie with kangaroo pocket and drawstring hood. Premium fleece interior.",
        price: 35000,
        compareAtPrice: 42000,
        costPrice: 18000,
        sku: "NUMBA-HOOD-GRY-004",
        barcode: "8901234567893",
        trackInventory: true,
        quantity: 28,
        lowStockThreshold: 10,
        category: "Clothing",
        tags: ["hoodie", "grey", "streetwear", "winter"],
        images: ["/products/hoodie-grey-1.jpg"],
        isActive: true,
        isFeatured: true,
        weight: 600,
        dimensions: { length: 35, width: 30, height: 3 },
        createdAt: new Date("2025-12-12"),
        updatedAt: new Date(),
      },
      {
        id: "prod_numba_005",
        storeId: store.id,
        name: "Crossbody Bag - Canvas",
        slug: "crossbody-bag-canvas",
        description:
          "Durable canvas crossbody bag with adjustable strap. Multiple compartments for organization.",
        price: 18000,
        compareAtPrice: 22000,
        costPrice: 9000,
        sku: "NUMBA-BAG-CAN-005",
        barcode: "8901234567894",
        trackInventory: true,
        quantity: 15,
        lowStockThreshold: 5,
        category: "Accessories",
        tags: ["bag", "crossbody", "canvas", "accessories"],
        images: ["/products/bag-canvas-1.jpg", "/products/bag-canvas-2.jpg"],
        isActive: true,
        isFeatured: false,
        weight: 300,
        dimensions: { length: 25, width: 20, height: 8 },
        createdAt: new Date("2025-12-15"),
        updatedAt: new Date(),
      },
    ],
  });

  console.log("✅ Products created:", products.count);

  // Create sample orders
  const orders = await prisma.order.createMany({
    data: [
      {
        id: "order_numba_001",
        storeId: store.id,
        orderNumber: 100001,
        customerName: "Chioma Okafor",
        customerEmail: "chioma.okafor@email.com",
        customerPhone: "+2348098765432",
        status: "DELIVERED",
        paymentStatus: "SUCCESS",
        fulfillmentStatus: "DELIVERED",
        subtotal: 43000,
        tax: 0,
        shipping: 2500,
        discount: 0,
        total: 45500,
        currency: "NGN",
        paymentMethod: "CARD",
        source: "STOREFRONT",
        shippingAddress: "12 Ogudu Road, Ojota, Lagos",
        shippingCity: "Lagos",
        shippingState: "Lagos",
        shippingCountry: "Nigeria",
        notes: "Please deliver before 5pm",
        createdAt: new Date("2026-01-15"),
        updatedAt: new Date("2026-01-18"),
      },
      {
        id: "order_numba_002",
        storeId: store.id,
        orderNumber: 100002,
        customerName: "Emeka Nwosu",
        customerEmail: "emeka.n@email.com",
        customerPhone: "+2347012345678",
        status: "PROCESSING",
        paymentStatus: "SUCCESS",
        fulfillmentStatus: "PROCESSING",
        subtotal: 28000,
        tax: 0,
        shipping: 2000,
        discount: 0,
        total: 30000,
        currency: "NGN",
        paymentMethod: "TRANSFER",
        source: "STOREFRONT",
        shippingAddress: "45 Allen Avenue, Ikeja, Lagos",
        shippingCity: "Lagos",
        shippingState: "Lagos",
        shippingCountry: "Nigeria",
        createdAt: new Date("2026-01-28"),
        updatedAt: new Date("2026-01-29"),
      },
      {
        id: "order_numba_003",
        storeId: store.id,
        orderNumber: 100003,
        customerName: "Aisha Bello",
        customerEmail: "aisha.bello@email.com",
        customerPhone: "+2348123456780",
        status: "PENDING_PAYMENT",
        paymentStatus: "PENDING",
        fulfillmentStatus: "UNFULFILLED",
        subtotal: 15000,
        tax: 0,
        shipping: 1500,
        discount: 0,
        total: 16500,
        currency: "NGN",
        paymentMethod: "CARD",
        source: "STOREFRONT",
        shippingAddress: "8 Wuse Zone 5, Abuja",
        shippingCity: "Abuja",
        shippingState: "FCT",
        shippingCountry: "Nigeria",
        createdAt: new Date("2026-01-30"),
        updatedAt: new Date("2026-01-30"),
      },
    ],
  });

  console.log("✅ Orders created:", orders.count);

  // Create customers
  const customers = await prisma.customer.createMany({
    data: [
      {
        id: "cust_numba_001",
        storeId: store.id,
        firstName: "Chioma",
        lastName: "Okafor",
        email: "chioma.okafor@email.com",
        phone: "+2348098765432",
        totalSpent: 45500,
        ordersCount: 1,
        tags: ["vip", "repeat-customer"],
        notes: "Loves graphic tees",
        createdAt: new Date("2026-01-15"),
        updatedAt: new Date("2026-01-18"),
      },
      {
        id: "cust_numba_002",
        storeId: store.id,
        firstName: "Emeka",
        lastName: "Nwosu",
        email: "emeka.n@email.com",
        phone: "+2347012345678",
        totalSpent: 30000,
        ordersCount: 1,
        tags: ["new-customer"],
        createdAt: new Date("2026-01-28"),
        updatedAt: new Date("2026-01-29"),
      },
      {
        id: "cust_numba_003",
        storeId: store.id,
        firstName: "Aisha",
        lastName: "Bello",
        email: "aisha.bello@email.com",
        phone: "+2348123456780",
        totalSpent: 0,
        ordersCount: 0,
        tags: ["new-customer"],
        createdAt: new Date("2026-01-30"),
        updatedAt: new Date("2026-01-30"),
      },
    ],
  });

  console.log("✅ Customers created:", customers.count);

  console.log("\n🎉 Demo merchant setup complete!");
  console.log("\n📧 Login credentials:");
  console.log("   Email: tolu@numba.store");
  console.log("   Password: Numba2026!");
  console.log("   OTP (for testing): 123456");
  console.log("\n🏪 Store: Numba Ventures");
  console.log("   Owner: Tolu Adeyemi");
  console.log("   Products: 5");
  console.log("   Orders: 3");
  console.log("   Customers: 3");
}

createDemoMerchant()
  .catch((e) => {
    console.error("❌ Error creating demo merchant:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
