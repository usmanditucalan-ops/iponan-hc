import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const apts = await prisma.appointment.findMany({
    where: { status: 'CONFIRMED' },
    select: { id: true, status: true, notes: true, date: true }
  });
  console.log(JSON.stringify(apts, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
