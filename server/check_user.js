const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: 'usmanditucalan@gmail.com' },
          { firstName: 'Usman' }
        ]
      },
      select: {
          email: true,
          phone: true,
          firstName: true,
          lastName: true
      }
    });
    console.log(JSON.stringify(users, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
