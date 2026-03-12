import { PrismaClient } from '../infra/db/src/generated/client';
import * as bcrypt from 'bcryptjs';

if (process.env.NODE_ENV === "production") {
  console.error("❌ FATAL: This script must NEVER run in production. Aborting.");
  process.exit(1);
}

const prisma = new PrismaClient();

async function seedToluNumbaDemo() {
  console.log('🚀 Creating Tolu/Numba demo account...\n');

  try {
    // 1. Create Store
    console.log('📦 Creating store...');
    const store = await prisma.store.upsert({
      where: { slug: 'numba-ventures' },
      update: {},
      create: {
        id: 'store_numba_demo_001',
        name: 'Numba',
        slug: 'numba-ventures',
        domain: 'numba-ventures',
        description: 'Premium streetwear and lifestyle brand offering curated collections of contemporary fashion, accessories, and lifestyle products for the modern Nigerian youth.',
        tagline: 'Streetwear Redefined',
        email: 'hello@numba.store',
        phone: '+2348123456789',
        country: 'NG',
        currency: 'NGN',
        timezone: 'Africa/Lagos',
        plan: 'STARTER',
        isActive: true,
        onboardingCompleted: true,
        onboardingLastStep: 'complete',
        brandColor: '#1a1a1a',
        createdAt: new Date('2025-12-01T10:00:00Z'),
        updatedAt: new Date(),
      }
    });
    console.log('✅ Store created:', store.slug);

    // 2. Create User
    console.log('\n👤 Creating user...');
    const hashedPassword = await bcrypt.hash('Numba2026!', 10);
    const user = await prisma.user.upsert({
      where: { email: 'tolu@numba.store' },
      update: {},
      create: {
        id: 'user_tolu_demo_001',
        email: 'tolu@numba.store',
        password: hashedPassword,
        firstName: 'Tolu',
        lastName: 'Adeyemi',
        phone: '+2348123456789',
        isEmailVerified: true,
        isPhoneVerified: true,
        createdAt: new Date('2025-12-01T10:00:00Z'),
        updatedAt: new Date(),
      }
    });
    console.log('✅ User created:', user.email);

    // 3. Create Store Membership
    console.log('\n🔗 Creating store membership...');
    const ownerRole = await prisma.role.findFirst({
      where: { name: 'OWNER' }
    });

    if (!ownerRole) {
      throw new Error('Owner role not found in database');
    }

    await prisma.storeMembership.upsert({
      where: {
        userId_storeId: {
          userId: user.id,
          storeId: store.id
        }
      },
      update: {},
      create: {
        userId: user.id,
        storeId: store.id,
        roleId: ownerRole.id,
        status: 'active',
        joinedAt: new Date('2025-12-01T10:00:00Z'),
      }
    });
    console.log('✅ Membership created');

    // 4. Create Store Profile
    console.log('\n🏪 Creating store profile...');
    await prisma.storeProfile.upsert({
      where: { storeId: store.id },
      update: {},
      create: {
        storeId: store.id,
        slug: 'numba-ventures',
        legalName: 'Numba Ventures Limited',
        businessRegistrationNumber: 'RC 1234567',
        addressLine1: 'Suite 12, Block B, Landmark Towers',
        addressLine2: '15 Admiralty Way',
        city: 'Lagos',
        state: 'Lagos',
        postalCode: '101241',
        country: 'NG',
        landmark: 'Opposite Circle Mall',
      }
    });
    console.log('✅ Store profile created');

    // 5. Create Onboarding Record
    console.log('\n📋 Creating onboarding record...');
    await prisma.merchantOnboarding.upsert({
      where: { storeId: store.id },
      update: {},
      create: {
        storeId: store.id,
        status: 'COMPLETED',
        currentStep: 'complete',
        data: {
          identity: {
            fullName: 'Tolu Adeyemi',
            phone: '+2348123456789'
          },
          business: {
            storeName: 'Numba',
            legalName: 'Numba Ventures Limited',
            phone: '+2348123456789',
            email: 'hello@numba.store',
            slug: 'numba-ventures',
            country: 'NG',
            state: 'Lagos',
            city: 'Lagos',
            registeredAddress: {
              addressLine1: 'Suite 12, Block B, Landmark Towers',
              addressLine2: '15 Admiralty Way',
              city: 'Lagos',
              state: 'Lagos',
              landmark: 'Opposite Circle Mall'
            },
            businessRegistrationType: 'limited_company'
          },
          branding: {
            brandColor: '#1a1a1a'
          },
          finance: {
            bankCode: '058',
            bankName: 'GTBank',
            accountNumber: '0123456789',
            accountName: 'NUMBA VENTURES LIMITED'
          },
          logistics: {
            pickupAddress: '15 Admiralty Way, Lekki Phase 1, Lagos',
            pickupAddressObj: {
              addressLine1: '15 Admiralty Way',
              city: 'Lekki Phase 1, Lagos',
              state: 'Lagos',
              landmark: 'Near Circle Mall, Lekki'
            }
          }
        },
        completedAt: new Date('2025-12-05T14:30:00Z'),
        updatedAt: new Date('2025-12-05T14:30:00Z'),
      }
    });
    console.log('✅ Onboarding completed');

    // 6. Create Products
    console.log('\n🛍️  Creating products...');
    const products = [
      {
        id: 'prod_numba_tee_001',
        title: 'Oversized Graphic Tee - Black',
        slug: 'oversized-graphic-tee-black',
        description: 'Premium 100% cotton oversized graphic tee featuring exclusive Numba artwork. Heavyweight fabric (220gsm) with ribbed crew neck and dropped shoulders. Perfect for the modern streetwear enthusiast.',
        price: 1500000, // ₦15,000 in kobo
        compareAtPrice: 2000000,
        costPrice: 800000,
        sku: 'NUMBA-TEE-BLK-001',
        barcode: '8901234567890',
        stock: 45,
        lowStockThreshold: 10,
        category: 'Clothing',
        tags: ['streetwear', 'tee', 'oversized', 'black', 'graphic'],
        isActive: true,
        isFeatured: true,
        createdAt: new Date('2025-12-05T15:00:00Z'),
      },
      {
        id: 'prod_numba_cargo_002',
        title: 'Cargo Pants - Olive Green',
        slug: 'cargo-pants-olive-green',
        description: 'Tactical-inspired cargo pants with multiple utility pockets. Durable ripstop fabric with adjustable waist and tapered fit. Features reinforced knees and water-resistant coating.',
        price: 2800000,
        compareAtPrice: 3500000,
        costPrice: 1500000,
        sku: 'NUMBA-CARGO-OLV-002',
        barcode: '8901234567891',
        stock: 32,
        lowStockThreshold: 8,
        category: 'Clothing',
        tags: ['pants', 'cargo', 'olive', 'streetwear'],
        isActive: true,
        isFeatured: true,
        createdAt: new Date('2025-12-08T10:00:00Z'),
      },
      {
        id: 'prod_numba_cap_003',
        title: 'Snapback Cap - Embroidered Logo',
        slug: 'snapback-cap-embroidered',
        description: 'Premium snapback with 3D embroidered Numba logo. Structured 6-panel crown with flat brim and adjustable snapback closure. Breathable eyelets and moisture-wicking sweatband.',
        price: 1200000,
        compareAtPrice: 1500000,
        costPrice: 600000,
        sku: 'NUMBA-CAP-BLK-003',
        barcode: '8901234567892',
        stock: 68,
        lowStockThreshold: 15,
        category: 'Accessories',
        tags: ['cap', 'snapback', 'accessories', 'black'],
        isActive: true,
        isFeatured: false,
        createdAt: new Date('2025-12-10T11:00:00Z'),
      },
      {
        id: 'prod_numba_hoodie_004',
        title: 'Hoodie - Grey Melange',
        slug: 'hoodie-grey-melange',
        description: 'Heavyweight pullover hoodie with premium fleece interior. Features kangaroo pocket, drawstring hood, and ribbed cuffs. Oversized fit with dropped shoulders for ultimate comfort.',
        price: 3500000,
        compareAtPrice: 4200000,
        costPrice: 1800000,
        sku: 'NUMBA-HOOD-GRY-004',
        barcode: '8901234567893',
        stock: 28,
        lowStockThreshold: 10,
        category: 'Clothing',
        tags: ['hoodie', 'grey', 'streetwear', 'winter'],
        isActive: true,
        isFeatured: true,
        createdAt: new Date('2025-12-12T09:00:00Z'),
      },
      {
        id: 'prod_numba_bag_005',
        title: 'Crossbody Bag - Canvas',
        slug: 'crossbody-bag-canvas',
        description: 'Durable canvas crossbody bag with adjustable strap. Multiple compartments including padded laptop sleeve (13"). Water-resistant coating and YKK zippers. Perfect for daily carry.',
        price: 1800000,
        compareAtPrice: 2200000,
        costPrice: 900000,
        sku: 'NUMBA-BAG-CAN-005',
        barcode: '8901234567894',
        stock: 15,
        lowStockThreshold: 5,
        category: 'Accessories',
        tags: ['bag', 'crossbody', 'canvas', 'accessories'],
        isActive: true,
        isFeatured: false,
        createdAt: new Date('2025-12-15T13:00:00Z'),
      },
    ];

    for (const productData of products) {
      await prisma.product.upsert({
        where: { id: productData.id },
        update: {},
        create: {
          ...productData,
          storeId: store.id,
        }
      });
    }
    console.log(`✅ Created ${products.length} products`);

    // 7. Create Customers
    console.log('\n👥 Creating customers...');
    const customers = [
      {
        id: 'cust_numba_001',
        firstName: 'Chioma',
        lastName: 'Okafor',
        email: 'chioma.okafor@gmail.com',
        phone: '+2348098765432',
        tags: ['vip', 'repeat-customer'],
        notes: 'Loves graphic tees, always asks for size L',
        createdAt: new Date('2025-12-15T14:00:00Z'),
      },
      {
        id: 'cust_numba_002',
        firstName: 'Emeka',
        lastName: 'Nwosu',
        email: 'emeka.n@yahoo.com',
        phone: '+2347012345678',
        tags: ['new-customer'],
        createdAt: new Date('2025-12-28T10:00:00Z'),
      },
      {
        id: 'cust_numba_003',
        firstName: 'Aisha',
        lastName: 'Bello',
        email: 'aisha.bello@outlook.com',
        phone: '+2348123456780',
        tags: ['new-customer', 'abuja'],
        createdAt: new Date('2026-01-30T16:00:00Z'),
      },
    ];

    for (const customerData of customers) {
      await prisma.customer.upsert({
        where: { id: customerData.id },
        update: {},
        create: {
          ...customerData,
          storeId: store.id,
        }
      });
    }
    console.log(`✅ Created ${customers.length} customers`);

    // 8. Create Orders
    console.log('\n📦 Creating orders...');
    const orders = [
      {
        id: 'order_numba_001',
        refCode: 'NMB-2026-001',
        customerId: 'cust_numba_001',
        customerName: 'Chioma Okafor',
        customerEmail: 'chioma.okafor@gmail.com',
        customerPhone: '+2348098765432',
        status: 'COMPLETED',
        paymentStatus: 'PAID',
        fulfillmentStatus: 'DELIVERED',
        subtotal: 4300000, // ₦43,000
        shipping: 250000,
        total: 4550000,
        shippingAddress: '12 Ogudu Road, Ojota, Lagos',
        shippingCity: 'Lagos',
        shippingState: 'Lagos',
        shippingCountry: 'Nigeria',
        notes: 'Please deliver before 5pm',
        createdAt: new Date('2026-01-15T14:34:00Z'),
        updatedAt: new Date('2026-01-18T16:00:00Z'),
      },
      {
        id: 'order_numba_002',
        refCode: 'NMB-2026-002',
        customerId: 'cust_numba_002',
        customerName: 'Emeka Nwosu',
        customerEmail: 'emeka.n@yahoo.com',
        customerPhone: '+2347012345678',
        status: 'PROCESSING',
        paymentStatus: 'PAID',
        fulfillmentStatus: 'PENDING',
        subtotal: 2800000,
        shipping: 200000,
        total: 3000000,
        shippingAddress: '45 Allen Avenue, Ikeja, Lagos',
        shippingCity: 'Lagos',
        shippingState: 'Lagos',
        shippingCountry: 'Nigeria',
        createdAt: new Date('2026-01-28T10:15:00Z'),
        updatedAt: new Date('2026-01-29T09:00:00Z'),
      },
      {
        id: 'order_numba_003',
        refCode: 'NMB-2026-003',
        customerId: 'cust_numba_003',
        customerName: 'Aisha Bello',
        customerEmail: 'aisha.bello@outlook.com',
        customerPhone: '+2348123456780',
        status: 'PENDING',
        paymentStatus: 'PENDING',
        fulfillmentStatus: 'PENDING',
        subtotal: 1500000,
        shipping: 350000,
        total: 1850000,
        shippingAddress: '8 Wuse Zone 5, Abuja',
        shippingCity: 'Abuja',
        shippingState: 'FCT',
        shippingCountry: 'Nigeria',
        createdAt: new Date('2026-01-30T16:22:00Z'),
        updatedAt: new Date('2026-01-30T16:22:00Z'),
      },
    ];

    for (const orderData of orders) {
      await prisma.order.upsert({
        where: { id: orderData.id },
        update: {},
        create: {
          ...orderData,
          storeId: store.id,
          currency: 'NGN',
          tax: 0,
          discount: 0,
        }
      });
    }
    console.log(`✅ Created ${orders.length} orders`);

    console.log('\n🎉 Demo account setup complete!\n');
    console.log('═══════════════════════════════════════');
    console.log('📧 LOGIN CREDENTIALS:');
    console.log('   Email: tolu@numba.store');
    console.log('   Password: Numba2026!');
    console.log('   OTP: 123456 (for verification)');
    console.log('═══════════════════════════════════════');
    console.log('🏪 STORE DETAILS:');
    console.log('   Store: Numba Ventures');
    console.log('   Owner: Tolu Adeyemi');
    console.log('   URL: vayva.shop/numba-ventures');
    console.log('   Products: 5');
    console.log('   Customers: 3');
    console.log('   Orders: 3');
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error creating demo account:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedToluNumbaDemo()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
