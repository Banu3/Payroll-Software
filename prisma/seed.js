import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with realistic demo data...');

  // Create demo branches
  const branches = [
    { name: 'Chennai', code: 'CHN', city: 'Chennai', state: 'Tamil Nadu', status: 'ACTIVE' },
    { name: 'Bangalore', code: 'BLR', city: 'Bangalore', state: 'Karnataka', status: 'ACTIVE' },
    { name: 'Mumbai', code: 'BOM', city: 'Mumbai', state: 'Maharashtra', status: 'ACTIVE' },
    { name: 'Hyderabad', code: 'HYD', city: 'Hyderabad', state: 'Telangana', status: 'ACTIVE' },
  ];

  for (const branch of branches) {
    await prisma.branch.upsert({
      where: { code: branch.code },
      update: {},
      create: branch,
    });
  }

  // Create Professional Tax Rules
  const ptRules = [
    { state: 'Tamil Nadu', effectiveFrom: new Date('2026-01-01'), salarySlab: 'Above 15000', taxAmount: 209 },
    { state: 'Karnataka', effectiveFrom: new Date('2026-01-01'), salarySlab: 'Above 15000', taxAmount: 200 },
    { state: 'Maharashtra', effectiveFrom: new Date('2026-01-01'), salarySlab: 'Above 10000', taxAmount: 200 }
  ];

  for (const rule of ptRules) {
    await prisma.professionalTaxRule.create({
      data: rule
    });
  }

  // Seed WhatsApp settings
  await prisma.whatsAppSetting.create({
    data: {
      provider: 'Twilio',
      enabled: false
    }
  });

  console.log('Seed completed successfully. (Note: Employees and complex relations are handled in the main Supabase instance)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
