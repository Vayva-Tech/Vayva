/**
 * Seed Data for Legal Industry Dashboard
 * 
 * Run with: npx prisma db seed
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding legal industry data...');

  // ============================================
  // 1. Practice Areas
  // ============================================
  const practiceAreas = [
    { name: 'Family Law', code: 'FAMILY', description: 'Divorce, custody, adoption' },
    { name: 'Criminal Defense', code: 'CRIMINAL', description: 'Felony and misdemeanor defense' },
    { name: 'Personal Injury', code: 'PI', description: 'Accidents, medical malpractice' },
    { name: 'Real Estate', code: 'REAL_ESTATE', description: 'Transactions, disputes, zoning' },
    { name: 'Corporate Law', code: 'CORPORATE', description: 'Business formation, M&A, contracts' },
    { name: 'Employment Law', code: 'EMPLOYMENT', description: 'Wrongful termination, discrimination' },
    { name: 'Immigration', code: 'IMMIGRATION', description: 'Visas, green cards, citizenship' },
    { name: 'Bankruptcy', code: 'BANKRUPTCY', description: 'Chapter 7, 11, 13 filings' },
  ];

  for (const area of practiceAreas) {
    await prisma.practiceArea.upsert({
      where: { code: area.code },
      update: {},
      create: area,
    });
  }

  console.log('✅ Practice areas seeded');

  // ============================================
  // 2. Trust Accounts
  // ============================================
  const trustAccounts = [
    {
      name: 'IOLTA Operating Account',
      type: 'iolta',
      accountNumber: '****1234',
      institution: 'First National Bank',
      routingNumber: '021000021',
      currentBalance: 125000.00,
      isActive: true,
    },
    {
      name: 'NON-IOLTA Client Funds',
      type: 'non_iolta',
      accountNumber: '****5678',
      institution: 'First National Bank',
      routingNumber: '021000021',
      currentBalance: 75000.00,
      isActive: true,
    },
  ];

  for (const account of trustAccounts) {
    await prisma.trustAccount.upsert({
      where: { name: account.name },
      update: {},
      create: account,
    });
  }

  console.log('✅ Trust accounts seeded');

  // ============================================
  // 3. Sample Cases (requires storeId)
  // ============================================
  const familyLaw = await prisma.practiceArea.findUnique({ where: { code: 'FAMILY' } });
  const criminalLaw = await prisma.practiceArea.findUnique({ where: { code: 'CRIMINAL' } });
  const personalInjury = await prisma.practiceArea.findUnique({ where: { code: 'PI' } });

  if (familyLaw && criminalLaw && personalInjury) {
    const cases = [
      {
        caseNumber: '2024-FL-001',
        practiceAreaId: familyLaw.id,
        title: 'Smith v. Smith - Divorce',
        type: 'civil',
        stage: 'discovery',
        status: 'active',
        feeArrangement: 'hourly',
        leadAttorneyId: 'attorney_001',
        leadAttorneyName: 'John Anderson',
        amountBilled: 15000.00,
        amountCollected: 12000.00,
        retainerBalance: 5000.00,
      },
      {
        caseNumber: '2024-CR-042',
        practiceAreaId: criminalLaw.id,
        title: 'State v. Johnson - DUI Defense',
        type: 'criminal',
        stage: 'pre_trial',
        status: 'active',
        feeArrangement: 'flat_fee',
        leadAttorneyId: 'attorney_002',
        leadAttorneyName: 'Sarah Mitchell',
        amountBilled: 5000.00,
        amountCollected: 5000.00,
        retainerBalance: 0,
      },
      {
        caseNumber: '2024-PI-118',
        practiceAreaId: personalInjury.id,
        title: 'Doe v. ABC Corp - Personal Injury',
        type: 'civil',
        stage: 'trial',
        status: 'active',
        feeArrangement: 'contingency',
        leadAttorneyId: 'attorney_003',
        leadAttorneyName: 'Michael Roberts',
        amountBilled: 0,
        amountCollected: 0,
        retainerBalance: 0,
      },
    ];

    for (const caseData of cases) {
      await prisma.case.create({
        data: caseData,
      });
    }

    console.log('✅ Sample cases seeded');
  }

  // ============================================
  // 4. Billing Rates
  // ============================================
  const billingRates = [
    {
      attorneyId: 'attorney_001',
      attorneyName: 'John Anderson',
      rate: 350.00,
      effectiveDate: new Date('2024-01-01'),
      isActive: true,
    },
    {
      attorneyId: 'attorney_002',
      attorneyName: 'Sarah Mitchell',
      rate: 400.00,
      effectiveDate: new Date('2024-01-01'),
      isActive: true,
    },
    {
      attorneyId: 'attorney_003',
      attorneyName: 'Michael Roberts',
      rate: 375.00,
      effectiveDate: new Date('2024-01-01'),
      isActive: true,
    },
    {
      attorneyId: 'paralegal_001',
      attorneyName: 'Emily Chen',
      role: 'paralegal',
      rate: 150.00,
      effectiveDate: new Date('2024-01-01'),
      isActive: true,
    },
  ];

  for (const rate of billingRates) {
    await prisma.billingRate.create({
      data: rate,
    });
  }

  console.log('✅ Billing rates seeded');

  // ============================================
  // 5. Document Templates
  // ============================================
  const templates = [
    {
      name: 'Engagement Letter - Family Law',
      category: 'engagement',
      practiceAreaId: familyLaw?.id,
      content: 'This engagement letter outlines the terms...',
      variables: ['clientName', 'caseType', 'feeAmount'],
      isActive: true,
    },
    {
      name: 'Motion to Dismiss',
      category: 'motion',
      practiceAreaId: criminalLaw?.id,
      content: 'COMES NOW the Defendant...',
      variables: ['caseNumber', 'courtName', 'defendantName'],
      isActive: true,
    },
    {
      name: 'Demand Letter - Personal Injury',
      category: 'letter',
      practiceAreaId: personalInjury?.id,
      content: 'Dear Insurance Company,',
      variables: ['clientName', 'accidentDate', 'injuries', 'demandAmount'],
      isActive: true,
    },
  ];

  for (const template of templates) {
    await prisma.documentTemplate.create({
      data: template,
    });
  }

  console.log('✅ Document templates seeded');

  // ============================================
  // 6. Court Deadlines
  // ============================================
  const activeCase = await prisma.case.findFirst({ where: { status: 'active' } });

  if (activeCase) {
    const deadlines = [
      {
        caseId: activeCase.id,
        title: 'Discovery Deadline',
        deadlineType: 'discovery',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        isStatutory: false,
        status: 'pending',
        priority: 'high',
      },
      {
        caseId: activeCase.id,
        title: 'File Motion in Limine',
        deadlineType: 'motion',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        isStatutory: false,
        status: 'pending',
        priority: 'critical',
      },
      {
        caseId: activeCase.id,
        title: 'Trial Brief Due',
        deadlineType: 'brief',
        dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        isStatutory: false,
        status: 'pending',
        priority: 'medium',
      },
    ];

    for (const deadline of deadlines) {
      await prisma.deadline.create({
        data: deadline,
      });
    }

    console.log('✅ Court deadlines seeded');
  }

  // ============================================
  // 7. CLE Credits (Sample)
  // ============================================
  const cleCredits = [
    {
      attorneyId: 'attorney_001',
      attorneyName: 'John Anderson',
      courseName: 'Advanced Family Law Litigation',
      creditHours: 12.0,
      ethicsCredits: 2.0,
      completionDate: new Date('2024-06-15'),
      reportingPeriod: '2024-2025',
      status: 'approved',
    },
    {
      attorneyId: 'attorney_002',
      attorneyName: 'Sarah Mitchell',
      courseName: 'Criminal Procedure Update 2024',
      creditHours: 8.0,
      ethicsCredits: 1.0,
      completionDate: new Date('2024-08-20'),
      reportingPeriod: '2024-2025',
      status: 'approved',
    },
  ];

  for (const credit of cleCredits) {
    await prisma.cleCredit.create({
      data: credit,
    });
  }

  console.log('✅ CLE credits seeded');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
