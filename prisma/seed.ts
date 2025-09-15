import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { id: 1, name: 'ADMIN' },
    { id: 2, name: 'USER' },
  ];

  for (const roleData of roles) {
    await prisma.roles.upsert({
      where: { id: roleData.id },
      update: roleData,
      create: roleData,
    });
  }

  const categories = [
    { id: 1, name: 'toys' },
    { id: 2, name: 'stationery' },
  ];

  for (const categoryData of categories) {
    await prisma.categories.upsert({
      where: { id: categoryData.id },
      update: categoryData,
      create: categoryData,
    });
  }

  console.log('Seed data created successfully');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
