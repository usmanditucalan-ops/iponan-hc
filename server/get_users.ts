import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const doctor = await prisma.user.findFirst({ where: { role: 'DOCTOR' } });
  const patient = await prisma.user.findFirst({ where: { role: 'PATIENT' } });
  const nurse = await prisma.user.findFirst({ where: { role: 'STAFF' } });

  console.log('Doctor:', doctor?.email);
  console.log('Patient:', patient?.email);
  console.log('Nurse:', nurse?.email);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
