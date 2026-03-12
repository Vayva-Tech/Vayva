
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'fred@123.design';
  console.log(`Fetching OTP for ${email}...`);
  
  const otpRecord = await prisma.otpCode.findFirst({
    where: {
      identifier: email,
      type: 'EMAIL_VERIFICATION',
      isUsed: false,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (otpRecord) {
    console.log(`Latest OTP: ${otpRecord.code}`);
    console.log(`Expires at: ${otpRecord.expiresAt}`);
  } else {
    console.log('No active OTP found.');
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
