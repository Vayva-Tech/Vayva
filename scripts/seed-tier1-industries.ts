/**
 * Seed Script for Tier 1 Industry Dashboards
 * 
 * Creates test data for Retail, Food/Restaurant, and Services industries
 * Run with: npx tsx scripts/seed-tier1-industries.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ============================================================================
// RETAIL INDUSTRY SEED DATA
// ============================================================================

async function seedRetailIndustry(storeId: string) {
  console.log(`🛍️  Seeding Retail data for store: ${storeId}`);

  // Create retail products
  const products = await Promise.all([
    prisma.retailProduct.create({
      data: {
        storeId,
        name: "Premium Wireless Headphones",
        sku: "AUDIO-001",
        price: 199.99,
        cost: 89.99,
        stock: 45,
        soldCount: 127,
        status: "active",
        category: "Electronics",
        images: ["/images/headphones-1.jpg"],
      },
    }),
    prisma.retailProduct.create({
      data: {
        storeId,
        name: "Organic Cotton T-Shirt",
        sku: "APPAREL-001",
        price: 39.99,
        cost: 12.99,
        stock: 8,
        soldCount: 234,
        status: "active",
        category: "Clothing",
        images: ["/images/tshirt-1.jpg"],
      },
    }),
    prisma.retailProduct.create({
      data: {
        storeId,
        name: "Stainless Steel Water Bottle",
        sku: "HOME-001",
        price: 29.99,
        cost: 8.99,
        stock: 0,
        soldCount: 89,
        status: "active",
        category: "Home & Kitchen",
        images: ["/images/bottle-1.jpg"],
      },
    }),
    prisma.retailProduct.create({
      data: {
        storeId,
        name: "Leather Wallet",
        sku: "ACCESS-001",
        price: 79.99,
        cost: 24.99,
        stock: 3,
        soldCount: 12,
        status: "active",
        category: "Accessories",
        images: ["/images/wallet-1.jpg"],
      },
    }),
    prisma.retailProduct.create({
      data: {
        storeId,
        name: "Smart Watch Series 5",
        sku: "TECH-001",
        price: 399.99,
        cost: 189.99,
        stock: 23,
        soldCount: 56,
        status: "active",
        category: "Electronics",
        images: ["/images/watch-1.jpg"],
      },
    }),
  ]);

  console.log(`✅ Created ${products.length} retail products`);

  // Create retail orders
  const orders = await Promise.all([
    prisma.retailOrder.create({
      data: {
        storeId,
        orderNumber: "RET-2024-001",
        customerId: "cust_001",
        status: "pending",
        total: 239.98,
        items: [
          { productId: products[0].id, quantity: 1, price: 199.99 },
          { productId: products[1].id, quantity: 1, price: 39.99 },
        ],
        shippingAddress: {
          street: "123 Main St",
          city: "San Francisco",
          state: "CA",
          zip: "94102",
          country: "USA",
        },
      },
    }),
    prisma.retailOrder.create({
      data: {
        storeId,
        orderNumber: "RET-2024-002",
        customerId: "cust_002",
        status: "processing",
        total: 429.98,
        items: [
          { productId: products[4].id, quantity: 1, price: 399.99 },
          { productId: products[1].id, quantity: 1, price: 29.99 },
        ],
      },
    }),
    prisma.retailOrder.create({
      data: {
        storeId,
        orderNumber: "RET-2024-003",
        customerId: "cust_003",
        status: "delayed",
        total: 109.98,
        items: [
          { productId: products[2].id, quantity: 2, price: 29.99 },
          { productId: products[3].id, quantity: 1, price: 49.99 },
        ],
      },
    }),
  ]);

  console.log(`✅ Created ${orders.length} retail orders`);

  // Create inventory alerts
  const alerts = await Promise.all([
    prisma.retailInventoryAlert.create({
      data: {
        storeId,
        productId: products[1].id,
        threshold: 10,
        currentStock: 8,
        severity: "low",
      },
    }),
    prisma.retailInventoryAlert.create({
      data: {
        storeId,
        productId: products[2].id,
        threshold: 5,
        currentStock: 0,
        severity: "out_of_stock",
      },
    }),
    prisma.retailInventoryAlert.create({
      data: {
        storeId,
        productId: products[3].id,
        threshold: 10,
        currentStock: 3,
        severity: "critical",
      },
    }),
  ]);

  console.log(`✅ Created ${alerts.length} inventory alerts`);
}

// ============================================================================
// FOOD/RESTAURANT INDUSTRY SEED DATA
// ============================================================================

async function seedFoodIndustry(storeId: string) {
  console.log(`🍽️  Seeding Food/Restaurant data for store: ${storeId}`);

  // Create menu items
  const menuItems = await Promise.all([
    prisma.menuItem.create({
      data: {
        storeId,
        name: "Margherita Pizza",
        description: "Classic tomato, mozzarella, and basil",
        price: 18.99,
        cost: 6.99,
        category: "Pizza",
        available: true,
        prepTimeMinutes: 15,
        ingredients: ["tomato sauce", "mozzarella", "basil", "olive oil"],
        allergens: ["dairy", "gluten"],
      },
    }),
    prisma.menuItem.create({
      data: {
        storeId,
        name: "Caesar Salad",
        description: "Romaine lettuce, parmesan, croutons",
        price: 12.99,
        cost: 4.99,
        category: "Salads",
        available: true,
        prepTimeMinutes: 8,
        ingredients: ["romaine", "parmesan", "croutons", "caesar dressing"],
        allergens: ["dairy", "gluten", "eggs"],
      },
    }),
    prisma.menuItem.create({
      data: {
        storeId,
        name: "Grilled Salmon",
        description: "Atlantic salmon with seasonal vegetables",
        price: 28.99,
        cost: 12.99,
        category: "Main Course",
        available: false,
        prepTimeMinutes: 25,
        ingredients: ["salmon", "vegetables", "lemon", "herbs"],
        allergens: ["fish"],
      },
    }),
    prisma.menuItem.create({
      data: {
        storeId,
        name: "Tiramisu",
        description: "Classic Italian dessert",
        price: 9.99,
        cost: 3.99,
        category: "Desserts",
        available: true,
        prepTimeMinutes: 5,
        ingredients: ["mascarpone", "espresso", "ladyfingers", "cocoa"],
        allergens: ["dairy", "gluten", "eggs"],
      },
    }),
    prisma.menuItem.create({
      data: {
        storeId,
        name: "Spaghetti Carbonara",
        description: "Pasta with egg, cheese, and pancetta",
        price: 16.99,
        cost: 5.99,
        category: "Pasta",
        available: true,
        prepTimeMinutes: 18,
        ingredients: ["spaghetti", "egg", "pecorino", "guanciale"],
        allergens: ["gluten", "dairy", "eggs"],
      },
    }),
  ]);

  console.log(`✅ Created ${menuItems.length} menu items`);

  // Create KDS orders
  const now = new Date();
  const kdsOrders = await Promise.all([
    prisma.kDSOrder.create({
      data: {
        storeId,
        orderNumber: "KDS-001",
        orderType: "dine-in",
        tableNumber: "5",
        items: [
          { menuItemId: menuItems[0].id, quantity: 2, notes: "Extra cheese" },
          { menuItemId: menuItems[1].id, quantity: 1 },
        ],
        status: "preparing",
        createdAt: new Date(now.getTime() - 15 * 60000), // 15 minutes ago
        prepTimeMinutes: 12,
      },
    }),
    prisma.kDSOrder.create({
      data: {
        storeId,
        orderNumber: "KDS-002",
        orderType: "takeout",
        items: [
          { menuItemId: menuItems[4].id, quantity: 1 },
          { menuItemId: menuItems[3].id, quantity: 2 },
        ],
        status: "pending",
        createdAt: new Date(now.getTime() - 5 * 60000), // 5 minutes ago
      },
    }),
    prisma.kDSOrder.create({
      data: {
        storeId,
        orderNumber: "KDS-003",
        orderType: "delivery",
        items: [
          { menuItemId: menuItems[0].id, quantity: 1 },
          { menuItemId: menuItems[2].id, quantity: 1 },
        ],
        status: "ready",
        createdAt: new Date(now.getTime() - 25 * 60000), // 25 minutes ago
        prepTimeMinutes: 22,
      },
    }),
  ]);

  console.log(`✅ Created ${kdsOrders.length} KDS orders`);

  // Create restaurant tables
  const tables = await Promise.all([
    prisma.restaurantTable.create({
      data: {
        storeId,
        tableNumber: "1",
        capacity: 2,
        status: "occupied",
        currentOrderId: kdsOrders[0].id,
        seatedAt: new Date(now.getTime() - 20 * 60000),
      },
    }),
    prisma.restaurantTable.create({
      data: {
        storeId,
        tableNumber: "2",
        capacity: 4,
        status: "available",
      },
    }),
    prisma.restaurantTable.create({
      data: {
        storeId,
        tableNumber: "3",
        capacity: 6,
        status: "reserved",
      },
    }),
    prisma.restaurantTable.create({
      data: {
        storeId,
        tableNumber: "4",
        capacity: 4,
        status: "occupied",
        currentOrderId: kdsOrders[2].id,
        seatedAt: new Date(now.getTime() - 30 * 60000),
      },
    }),
    prisma.restaurantTable.create({
      data: {
        storeId,
        tableNumber: "5",
        capacity: 2,
        status: "available",
      },
    }),
  ]);

  console.log(`✅ Created ${tables.length} restaurant tables`);
}

// ============================================================================
// SERVICES INDUSTRY SEED DATA
// ============================================================================

async function seedServicesIndustry(storeId: string) {
  console.log(`💼 Seeding Services data for store: ${storeId}`);

  // Create services
  const services = await Promise.all([
    prisma.service.create({
      data: {
        storeId,
        name: "Haircut & Styling",
        description: "Professional haircut and styling",
        duration: 45,
        price: 45.0,
        category: "Hair",
        active: true,
        bookingBuffer: 15,
      },
    }),
    prisma.service.create({
      data: {
        storeId,
        name: "Full Body Massage",
        description: "Relaxing 60-minute massage",
        duration: 60,
        price: 89.99,
        category: "Wellness",
        active: true,
        bookingBuffer: 10,
      },
    }),
    prisma.service.create({
      data: {
        storeId,
        name: "Facial Treatment",
        description: "Deep cleansing facial",
        duration: 50,
        price: 65.0,
        category: "Skincare",
        active: true,
        bookingBuffer: 10,
      },
    }),
    prisma.service.create({
      data: {
        storeId,
        name: "Manicure & Pedicure",
        description: "Complete nail care",
        duration: 75,
        price: 55.0,
        category: "Nails",
        active: true,
        bookingBuffer: 5,
      },
    }),
    prisma.service.create({
      data: {
        storeId,
        name: "Personal Training Session",
        description: "One-on-one fitness training",
        duration: 60,
        price: 75.0,
        category: "Fitness",
        active: true,
        bookingBuffer: 15,
      },
    }),
  ]);

  console.log(`✅ Created ${services.length} services`);

  // Create staff members
  const staffMembers = await Promise.all([
    prisma.staffMember.create({
      data: {
        storeId,
        name: "Sarah Johnson",
        role: "Senior Stylist",
        servicesOffered: [services[0].id],
        schedule: [
          {
            dayOfWeek: 1,
            startTime: "09:00",
            endTime: "17:00",
          },
        ],
        utilizationRate: 75.5,
      },
    }),
    prisma.staffMember.create({
      data: {
        storeId,
        name: "Michael Chen",
        role: "Massage Therapist",
        servicesOffered: [services[1].id],
        schedule: [
          {
            dayOfWeek: 1,
            startTime: "10:00",
            endTime: "18:00",
          },
        ],
        utilizationRate: 82.3,
      },
    }),
    prisma.staffMember.create({
      data: {
        storeId,
        name: "Emma Williams",
        role: "Esthetician",
        servicesOffered: [services[2].id],
        schedule: [
          {
            dayOfWeek: 1,
            startTime: "09:00",
            endTime: "17:00",
          },
        ],
        utilizationRate: 68.9,
      },
    }),
  ]);

  console.log(`✅ Created ${staffMembers.length} staff members`);

  // Create bookings for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const bookings = await Promise.all([
    prisma.booking.create({
      data: {
        storeId,
        customerId: "cust_001",
        serviceId: services[0].id,
        staffId: staffMembers[0].id,
        startTime: new Date(today.getTime() + 9 * 60 * 60 * 1000), // 9:00 AM
        endTime: new Date(today.getTime() + 9.75 * 60 * 60 * 1000), // 9:45 AM
        status: "confirmed",
        notes: "First time customer",
        reminderSent: true,
      },
    }),
    prisma.booking.create({
      data: {
        storeId,
        customerId: "cust_002",
        serviceId: services[1].id,
        staffId: staffMembers[1].id,
        startTime: new Date(today.getTime() + 10 * 60 * 60 * 1000), // 10:00 AM
        endTime: new Date(today.getTime() + 11 * 60 * 60 * 1000), // 11:00 AM
        status: "confirmed",
        reminderSent: true,
      },
    }),
    prisma.booking.create({
      data: {
        storeId,
        customerId: "cust_003",
        serviceId: services[2].id,
        staffId: staffMembers[2].id,
        startTime: new Date(today.getTime() + 11 * 60 * 60 * 1000), // 11:00 AM
        endTime: new Date(today.getTime() + 11.83 * 60 * 60 * 1000), // 11:50 AM
        status: "pending",
        reminderSent: false,
      },
    }),
    prisma.booking.create({
      data: {
        storeId,
        customerId: "cust_004",
        serviceId: services[0].id,
        staffId: staffMembers[0].id,
        startTime: new Date(today.getTime() + 14 * 60 * 60 * 1000), // 2:00 PM
        endTime: new Date(today.getTime() + 14.75 * 60 * 60 * 1000), // 2:45 PM
        status: "cancelled",
        reminderSent: true,
      },
    }),
    prisma.booking.create({
      data: {
        storeId,
        customerId: "cust_005",
        serviceId: services[3].id,
        startTime: new Date(today.getTime() + 15 * 60 * 60 * 1000), // 3:00 PM
        endTime: new Date(today.getTime() + 16.25 * 60 * 60 * 1000), // 4:15 PM
        status: "no_show",
        reminderSent: true,
      },
    }),
  ]);

  console.log(`✅ Created ${bookings.length} bookings`);
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log("🌱 Starting Tier 1 Industry Seed Script...\n");

  // Use a test store ID or create one
  const testStoreId = process.env.SEED_STORE_ID || "store_test_tier1";

  try {
    // Seed all three industries
    await seedRetailIndustry(testStoreId);
    await seedFoodIndustry(testStoreId);
    await seedServicesIndustry(testStoreId);

    console.log("\n✅ Tier 1 Industry seeding completed successfully!");
    console.log(`📊 Store ID: ${testStoreId}`);
    console.log("\nTo test the dashboards:");
    console.log(`   - Retail: /api/retail/dashboard?storeId=${testStoreId}`);
    console.log(`   - Restaurant: /api/restaurant/dashboard?storeId=${testStoreId}`);
    console.log(`   - Services: /api/services/dashboard?storeId=${testStoreId}`);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
