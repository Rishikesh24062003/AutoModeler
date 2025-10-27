import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function setupUsers() {
  // Set known passwords for each role
  const users = [
    { email: 'superadmin@platform.com', password: 'admin123', role: 'ADMIN' },
    { email: 'manager@company.com', password: 'manager123', role: 'MANAGER' },
    { email: 'viewer@company.com', password: 'viewer123', role: 'VIEWER' }
  ];

  console.log('🔧 Setting up user credentials...\n');

  for (const user of users) {
    const hashedPassword = bcrypt.hashSync(user.password, 10);
    await prisma.user.upsert({
      where: { email: user.email },
      update: { password: hashedPassword },
      create: {
        email: user.email,
        password: hashedPassword,
        role: user.role as any
      }
    });
    console.log(`✅ ${user.role.padEnd(8)} | Email: ${user.email.padEnd(30)} | Password: ${user.password}`);
  }

  console.log('\n✨ All user credentials have been set up successfully!');
  await prisma.$disconnect();
}

setupUsers().catch((error) => {
  console.error('❌ Error setting up users:', error);
  process.exit(1);
});
