import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create Countries
  const egypt = await prisma.country.upsert({
    where: { code: 'EG' },
    update: {},
    create: {
      code: 'EG',
      nameAr: 'مصر',
      nameEn: 'Egypt',
    },
  });

  const saudiArabia = await prisma.country.upsert({
    where: { code: 'SA' },
    update: {},
    create: {
      code: 'SA',
      nameAr: 'السعودية',
      nameEn: 'Saudi Arabia',
    },
  });

  const palestine = await prisma.country.upsert({
    where: { code: 'PS' },
    update: {},
    create: {
      code: 'PS',
      nameAr: 'فلسطين',
      nameEn: 'Palestine',
    },
  });

  console.log('✅ Countries created');

  // Create Banks for Egypt
  const nbe = await prisma.bank.create({
    data: {
      countryId: egypt.id,
      nameAr: 'البنك الأهلي المصري',
      nameEn: 'National Bank of Egypt',
    },
  });

  const cib = await prisma.bank.create({
    data: {
      countryId: egypt.id,
      nameAr: 'البنك التجاري الدولي',
      nameEn: 'Commercial International Bank',
    },
  });

  // Create Banks for Saudi Arabia
  const riyadBank = await prisma.bank.create({
    data: {
      countryId: saudiArabia.id,
      nameAr: 'بنك الرياض',
      nameEn: 'Riyad Bank',
    },
  });

  const fransiBank = await prisma.bank.create({
    data: {
      countryId: saudiArabia.id,
      nameAr: 'البنك السعودي الفرنسي',
      nameEn: 'Banque Saudi Fransi',
    },
  });

  // Create Banks for Palestine
  const arabBank = await prisma.bank.create({
    data: {
      countryId: palestine.id,
      nameAr: 'البنك العربي',
      nameEn: 'Arab Bank',
    },
  });

  console.log('✅ Banks created');

  console.log('🎉 Seed completed successfully!');
  console.log(`Created ${3} countries and ${5} banks`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error during seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
