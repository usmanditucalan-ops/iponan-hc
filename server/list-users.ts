import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      email: true,
      role: true,
      firstName: true,
      lastName: true
    }
  });
  
  const outputPath = path.join(__dirname, 'users-list.json');
  fs.writeFileSync(outputPath, JSON.stringify(users, null, 2), 'utf8');
  console.log(`Successfully wrote ${users.length} users to ${outputPath}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
