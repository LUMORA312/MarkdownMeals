import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@foodman.com';
  const password = 'admin123';
  const hashed = await bcrypt.hash(password, 10);

  const admin = await prisma.admin.upsert({
    where: { email },
    update: { password: hashed },
    create: { email, password: hashed, name: 'FoodMan Admin' },
  });

  console.log(`Admin seeded: ${admin.email} (password: ${password})`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
