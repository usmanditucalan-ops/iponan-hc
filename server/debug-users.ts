
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('All Users:', users.map(u => ({ id: u.id, name: u.firstName + ' ' + u.lastName, role: u.role })));
  
  const doctors = users.filter(u => u.role === 'DOCTOR');
  console.log('Doctors count:', doctors.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
