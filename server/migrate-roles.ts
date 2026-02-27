import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Migrating NURSE roles to ADMIN...');
  // Note: we're using raw SQL or bypassing type checks if Prisma client hasn't been re-generated yet.
  // We can just use raw query to ensure it bypasses any Prisma Enum limitations if needed.
  const result = await prisma.$executeRaw`UPDATE "users" SET "role" = 'ADMIN' WHERE "role" = 'NURSE'`;
  console.log(`Updated ${result} users.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
