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
