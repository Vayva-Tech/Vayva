/**
 * Seed data for Customer Experience & Marketing features
 * Run with: npx prisma db seed
 */

import { PrismaClient } from '@vayva/db';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Customer Experience & Marketing data...');

  // Get a store to use for seeding (create one if needed)
  let store = await prisma.store.findFirst();
  if (!store) {
    console.log('⚠️ No store found, skipping seed data creation');
    return;
  }

  // Get or create a customer for testing
  let customer = await prisma.customer.findFirst({
    where: { storeId: store.id },
  });

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        storeId: store.id,
        email: 'test-customer@example.com',
        name: 'Test Customer',
        phone: '+2348012345678',
      },
    });
  }

  // ==================== REFERRAL SYSTEM ====================
  console.log('📊 Seeding Referral System...');

  // Create referral program
  const referralProgram = await prisma.referralProgram.upsert({
    where: { storeId: store.id },
    update: {},
    create: {
      storeId: store.id,
      name: 'Spring Referral Program',
      description: 'Refer friends and earn rewards!',
      rewardType: 'percentage',
      rewardValue: 10,
      referrerReward: 500, // NGN 500
      referredReward: 200, // NGN 200
      minimumOrder: 1000,
      maxRewardsPerUser: 10,
      expirationDays: 30,
      terms: 'Valid for new customers only. Rewards credited to wallet.',
      isActive: true,
    },
  });

  // Create referral code for customer
  const referralCode = await prisma.referralCode.upsert({
    where: { code: 'TEST123' },
    update: {},
    create: {
      programId: referralProgram.id,
      customerId: customer.id,
      code: 'TEST123',
      link: `https://${store.slug}.vayva.ng/ref/TEST123`,
      clicks: 15,
      signups: 3,
      conversions: 1,
      rewardsEarned: 500,
      isActive: true,
    },
  });

  // Create referral conversion
  await prisma.referralConversion.createMany({
    skipDuplicates: true,
    data: [
      {
        codeId: referralCode.id,
        referrerId: customer.id,
        referredId: customer.id, // Self-referral for testing
        orderId: null,
        orderAmount: 2500,
        rewardAmount: 500,
        status: 'completed',
        convertedAt: new Date(),
      },
    ],
  });

  console.log('✅ Referral System seeded');

  // ==================== WHATSAPP BROADCAST ====================
  console.log('📱 Seeding WhatsApp Broadcast...');

  // Create templates
  const welcomeTemplate = await prisma.whatsAppTemplate.upsert({
    where: { id: 'template-welcome-001' },
    update: {},
    create: {
      id: 'template-welcome-001',
      storeId: store.id,
      name: 'Welcome Message',
      category: 'utility',
      content: 'Welcome to {{storeName}}! 🎉 We\'re excited to have you. Use code WELCOME10 for 10% off your first order.',
      variables: ['storeName'],
      isApproved: true,
      approvalStatus: 'approved',
      usageCount: 5,
    },
  });

  const promoTemplate = await prisma.whatsAppTemplate.upsert({
    where: { id: 'template-promo-001' },
    update: {},
    create: {
      id: 'template-promo-001',
      storeId: store.id,
      name: 'Weekend Sale',
      category: 'marketing',
      content: '🔥 Weekend Flash Sale! Get {{discount}} off all items until Sunday midnight. Shop now: {{link}}',
      variables: ['discount', 'link'],
      isApproved: true,
      approvalStatus: 'approved',
      usageCount: 2,
    },
  });

  // Create broadcast
  const broadcast = await prisma.whatsAppBroadcast.create({
    data: {
      storeId: store.id,
      name: 'Weekend Flash Sale',
      content: '🔥 Weekend Flash Sale! Get 20% off all items until Sunday midnight.',
      templateId: promoTemplate.id,
      status: 'sent',
      scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      totalRecipients: 150,
      sentCount: 148,
      failedCount: 2,
      openCount: 89,
      clickCount: 34,
      createdBy: 'system',
    },
  });

  // Create broadcast recipients
  await prisma.whatsAppBroadcastRecipient.createMany({
    data: [
      {
        broadcastId: broadcast.id,
        customerId: customer.id,
        phoneNumber: customer.phone ?? '+2348012345678',
        status: 'sent',
        sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('✅ WhatsApp Broadcast seeded');

  // ==================== VIRTUAL TRY-ON ====================
  console.log('👗 Seeding Virtual Try-On...');

  // Create try-on asset
  const tryOnAsset = await prisma.virtualTryOnAsset.create({
    data: {
      storeId: store.id,
      name: 'Summer Dress - Red',
      assetType: 'clothing',
      sourceUrl: 'https://example.com/assets/dress-red.png',
      generatedUrl: 'https://example.com/assets/dress-red-processed.png',
      maskUrl: 'https://example.com/assets/dress-red-mask.png',
      status: 'ready',
      metadata: {
        category: 'dresses',
        color: 'red',
        size: 'M',
      },
    },
  });

  // Create try-on session
  await prisma.tryOnSession.create({
    data: {
      storeId: store.id,
      customerId: customer.id,
      productAssetId: tryOnAsset.id,
      customerPhotoUrl: 'https://example.com/photos/customer-001.jpg',
      generatedImageUrl: 'https://example.com/tryon/result-001.jpg',
      status: 'completed',
      shareUrl: 'https://vayva.ng/tryon/share/abc123',
      metadata: {
        purchased: true,
        productId: 'prod-123',
      },
      startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 1000),
    },
  });

  console.log('✅ Virtual Try-On seeded');

  console.log('\n🎉 All Customer Experience & Marketing data seeded successfully!');
  console.log(`\nSummary:`);
  console.log(`- Referral Program: ${referralProgram.name}`);
  console.log(`- Referral Code: ${referralCode.code}`);
  console.log(`- WhatsApp Templates: 2 created`);
  console.log(`- WhatsApp Broadcasts: 1 created`);
  console.log(`- Virtual Try-On Assets: 1 created`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
