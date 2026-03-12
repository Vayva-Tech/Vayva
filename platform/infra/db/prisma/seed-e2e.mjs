import { PrismaClient } from '../src/generated/client/index.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'e2e@test.com';
  const password = 'TestPass123!';
  
  // Check if user exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Test user exists:', existing.id);
    return;
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = await prisma.user.create({
    data: {
      id: 'user_e2e_test',
      email,
      password: hashedPassword,
      firstName: 'E2E',
      lastName: 'Test',
      isEmailVerified: true,
    },
  });
  console.log('Created user:', user.id);
  
  const store = await prisma.store.create({
    data: {
      id: 'store_e2e_test',
      name: 'E2E Test Store',
      slug: 'e2e-test-store',
      isLive: true,
      onboardingStatus: 'COMPLETE',
    },
  });
  console.log('Created store:', store.id);
  
  await prisma.membership.create({
    data: {
      id: 'mem_e2e_test',
      userId: user.id,
      storeId: store.id,
      role: 'OWNER',
      status: 'active',
    },
  });
  
  await prisma.wallet.create({
    data: {
      id: 'wallet_e2e_test',
      storeId: store.id,
      balance: 100000,
      currency: 'NGN',
    },
  });
  
  console.log('E2E seed complete!');
  console.log('Login: e2e@test.com / TestPass123!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => await prisma.$disconnect());
