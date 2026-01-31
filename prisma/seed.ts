// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface SeedConfig {
  adminEmail: string;
  adminPassword: string;
}

function getSeedConfig(): SeedConfig {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      '❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env file for seeding\n' +
        'Example:\n' +
        'ADMIN_EMAIL=admin@example.com\n' +
        'ADMIN_PASSWORD=YourSecurePassword123'
    );
  }

  // Базовая валидация email
  if (!adminEmail.includes('@')) {
    throw new Error('❌ ADMIN_EMAIL must be a valid email address');
  }

  // Валидация пароля
  if (adminPassword.length < 8) {
    throw new Error('❌ ADMIN_PASSWORD must be at least 8 characters long');
  }

  return {
    adminEmail,
    adminPassword,
  };
}

async function createAdminUser(email: string, password: string) {
  // Проверяем, не существует ли уже пользователь
  const existingUser = await prisma.users.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log('ℹ️ Admin user already exists, updating password...');

    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.users.update({
      where: { email },
      data: {
        password: Buffer.from(hashedPassword),
        role_id: 1,
      },
    });

    return 'updated';
  } else {
    // Создаем нового пользователя
    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.users.create({
      data: {
        email,
        password: Buffer.from(hashedPassword),
        role_id: 1,
      },
    });

    return 'created';
  }
}

async function main() {
  console.log('🌱 Starting database seed...');

  // Получаем конфигурацию
  const config = getSeedConfig();

  // Создаем роли
  console.log('👥 Creating roles...');
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

  // Создаем категории
  console.log('📦 Creating categories...');
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

  // Создаем статусы заказов
  console.log('📦 Creating orders status...');
  const order_statuses = [
    { id: 1, name: 'pending' },
    { id: 2, name: 'confirmed' },
    { id: 3, name: 'assembling' },
    { id: 4, name: 'ready' },
    { id: 5, name: 'completed' },
    { id: 6, name: 'cancelled' },
  ];

  for (const orderStatus of order_statuses) {
    await prisma.order_statuses.upsert({
      where: { id: orderStatus.id },
      update: orderStatus,
      create: orderStatus,
    });
  }

  // Создаем администратора
  console.log('👑 Creating admin user...');
  const action = await createAdminUser(config.adminEmail, config.adminPassword);

  console.log(`✅ Admin user ${action} successfully`);
  console.log(`📧 Email: ${config.adminEmail}`);
  console.log('🔑 Password: (from .env file)');
  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch(error => {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
