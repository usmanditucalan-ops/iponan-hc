import { PrismaClient, UserRole, Gender } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);
  
  const users: { email: string; role: UserRole; firstName: string; lastName: string }[] = [
    { email: 'admin@clinic.com', role: UserRole.ADMIN, firstName: 'Clinic', lastName: 'Admin' },
    { email: 'doctor@clinic.com', role: UserRole.DOCTOR, firstName: 'Dr. Jane', lastName: 'Smith' },
    { email: 'patient@clinic.com', role: UserRole.PATIENT, firstName: 'John', lastName: 'Doe' },
  ];

  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { 
        role: u.role,
        firstName: u.firstName,
        lastName: u.lastName,
        password: password
      },
      create: { 
        ...u,
        password: password,
        phone: '+63000000000',
      }
    });

    // If role is PATIENT, ensure a patient record exists
    if (u.role === UserRole.PATIENT) {
      await prisma.patient.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          dateOfBirth: new Date('1990-01-01'),
          gender: Gender.MALE,
          address: 'Barangay Iponan, Cagayan de Oro City',
        }
      });
    }
  }
  
  console.log('Successfully provisioned 4 test users with password: password123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
