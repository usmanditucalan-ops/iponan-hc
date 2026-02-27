import bcrypt from 'bcrypt';
import { Prisma, UserRole } from '@prisma/client';
import prisma from './src/db';

type SamplePerson = {
  firstName: string;
  lastName: string;
  gender: 'MALE' | 'FEMALE';
  bloodType: string;
  allergies: string;
};

const SAMPLE_PEOPLE: SamplePerson[] = [
  { firstName: 'Ariana', lastName: 'Lopez', gender: 'FEMALE', bloodType: 'O+', allergies: 'None' },
  { firstName: 'Brandon', lastName: 'Cruz', gender: 'MALE', bloodType: 'A+', allergies: 'Seafood' },
  { firstName: 'Camille', lastName: 'Reyes', gender: 'FEMALE', bloodType: 'B+', allergies: 'Penicillin' },
  { firstName: 'Daniel', lastName: 'Torres', gender: 'MALE', bloodType: 'AB+', allergies: 'Dust' },
  { firstName: 'Elaine', lastName: 'Santos', gender: 'FEMALE', bloodType: 'O-', allergies: 'None' },
  { firstName: 'Francis', lastName: 'Mendoza', gender: 'MALE', bloodType: 'A-', allergies: 'Shellfish' },
  { firstName: 'Gina', lastName: 'Villanueva', gender: 'FEMALE', bloodType: 'B-', allergies: 'Latex' },
  { firstName: 'Harold', lastName: 'Navarro', gender: 'MALE', bloodType: 'O+', allergies: 'Peanuts' },
  { firstName: 'Ivy', lastName: 'Castillo', gender: 'FEMALE', bloodType: 'A+', allergies: 'None' },
  { firstName: 'Jared', lastName: 'Fernandez', gender: 'MALE', bloodType: 'AB-', allergies: 'Pollen' },
  { firstName: 'Katrina', lastName: 'Aquino', gender: 'FEMALE', bloodType: 'O+', allergies: 'Ibuprofen' },
  { firstName: 'Liam', lastName: 'Ramos', gender: 'MALE', bloodType: 'B+', allergies: 'None' },
  { firstName: 'Mika', lastName: 'Padilla', gender: 'FEMALE', bloodType: 'A-', allergies: 'None' },
  { firstName: 'Noel', lastName: 'Gonzales', gender: 'MALE', bloodType: 'O-', allergies: 'Seafood' },
  { firstName: 'Olivia', lastName: 'Dela Cruz', gender: 'FEMALE', bloodType: 'AB+', allergies: 'Dust' },
  { firstName: 'Paolo', lastName: 'Garcia', gender: 'MALE', bloodType: 'B-', allergies: 'None' },
  { firstName: 'Queenie', lastName: 'Bautista', gender: 'FEMALE', bloodType: 'O+', allergies: 'None' },
  { firstName: 'Ralph', lastName: 'Flores', gender: 'MALE', bloodType: 'A+', allergies: 'Shrimp' },
  { firstName: 'Sabrina', lastName: 'Morales', gender: 'FEMALE', bloodType: 'B+', allergies: 'None' },
  { firstName: 'Tristan', lastName: 'Diaz', gender: 'MALE', bloodType: 'AB-', allergies: 'Aspirin' },
  { firstName: 'Una', lastName: 'Lim', gender: 'FEMALE', bloodType: 'O-', allergies: 'Pollen' },
  { firstName: 'Vincent', lastName: 'Salazar', gender: 'MALE', bloodType: 'A-', allergies: 'None' },
  { firstName: 'Wendy', lastName: 'Ortega', gender: 'FEMALE', bloodType: 'B-', allergies: 'Peanuts' },
  { firstName: 'Xander', lastName: 'Valdez', gender: 'MALE', bloodType: 'O+', allergies: 'None' },
  { firstName: 'Yasmin', lastName: 'Luna', gender: 'FEMALE', bloodType: 'AB+', allergies: 'Dust' },
  { firstName: 'Zion', lastName: 'Perez', gender: 'MALE', bloodType: 'A+', allergies: 'None' },
  { firstName: 'Althea', lastName: 'Rivera', gender: 'FEMALE', bloodType: 'O+', allergies: 'Milk' },
  { firstName: 'Boris', lastName: 'Domingo', gender: 'MALE', bloodType: 'B+', allergies: 'None' },
  { firstName: 'Celine', lastName: 'Velasco', gender: 'FEMALE', bloodType: 'A-', allergies: 'Latex' },
  { firstName: 'Dustin', lastName: 'Herrera', gender: 'MALE', bloodType: 'O-', allergies: 'None' },
];

const REASONS = [
  'Fever and cough',
  'Headache and dizziness',
  'Hypertension follow-up',
  'Diabetes blood sugar check',
  'General body weakness',
  'Stomach pain',
  'Skin allergy consultation',
  'Respiratory symptoms',
];

const DIAGNOSES = [
  'Acute upper respiratory infection',
  'Tension-type headache',
  'Essential hypertension',
  'Type 2 diabetes mellitus',
  'Acute gastritis',
  'Allergic dermatitis',
  'Viral syndrome',
  'Mild dehydration',
];

async function ensureCoreUsers() {
  const defaultPassword = await bcrypt.hash('Password123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@clinic.com' },
    update: { role: 'ADMIN', isActive: true, password: defaultPassword, firstName: 'Clinic', lastName: 'Admin' },
    create: {
      email: 'admin@clinic.com',
      password: defaultPassword,
      role: 'ADMIN',
      firstName: 'Clinic',
      lastName: 'Admin',
      isActive: true,
      phone: '09170000001',
    },
  });

  await prisma.user.upsert({
    where: { email: 'staff@clinic.com' },
    update: { role: 'STAFF', isActive: true, password: defaultPassword, firstName: 'Clinic', lastName: 'Staff' },
    create: {
      email: 'staff@clinic.com',
      password: defaultPassword,
      role: 'STAFF',
      firstName: 'Clinic',
      lastName: 'Staff',
      isActive: true,
      phone: '09170000002',
    },
  });

  let doctor = await prisma.user.findFirst({
    where: { role: 'DOCTOR', isActive: true },
  });

  if (!doctor) {
    doctor = await prisma.user.upsert({
      where: { email: 'doctor@clinic.com' },
      update: {
        role: 'DOCTOR',
        isActive: true,
        password: defaultPassword,
        firstName: 'General',
        lastName: 'Physician',
      },
      create: {
        email: 'doctor@clinic.com',
        password: defaultPassword,
        role: 'DOCTOR',
        isActive: true,
        firstName: 'General',
        lastName: 'Physician',
        phone: '09170000003',
      },
    });
  }

  return { doctor };
}

function makeDateOfBirth(index: number): Date {
  const year = 1972 + (index % 28);
  const month = index % 12;
  const day = 1 + (index % 27);
  return new Date(Date.UTC(year, month, day));
}

function makeAppointmentDate(index: number): Date {
  const now = new Date();
  const date = new Date(now);
  date.setDate(now.getDate() + (index % 14));
  date.setHours(8 + (index % 8), 0, 0, 0);
  return date;
}

async function main() {
  const { doctor } = await ensureCoreUsers();

  const defaultPassword = await bcrypt.hash('Password123', 10);
  let createdPatients = 0;
  let createdAppointments = 0;
  let createdRecords = 0;
  let createdVitals = 0;
  let createdNotifications = 0;

  for (let i = 0; i < SAMPLE_PEOPLE.length; i++) {
    const person = SAMPLE_PEOPLE[i];
    const idx = i + 1;
    const email = `sample.patient${String(idx).padStart(2, '0')}@clinic.com`;
    const phone = `0917${String(4000000 + idx).padStart(7, '0')}`;

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        firstName: person.firstName,
        lastName: person.lastName,
        role: UserRole.PATIENT,
        isActive: true,
        phone,
        password: defaultPassword,
      },
      create: {
        email,
        password: defaultPassword,
        role: UserRole.PATIENT,
        isActive: true,
        firstName: person.firstName,
        lastName: person.lastName,
        phone,
        language: 'English',
      },
    });

    const existingPatient = await prisma.patient.findUnique({ where: { userId: user.id } });
    const patient = existingPatient
      ? await prisma.patient.update({
          where: { userId: user.id },
          data: {
            dateOfBirth: makeDateOfBirth(i),
            gender: person.gender,
            address: `Purok ${1 + (i % 8)}, Barangay Iponan, Cagayan de Oro City`,
            emergencyContact: `Emergency Contact ${idx} - 0918${String(5000000 + idx).padStart(7, '0')}`,
            bloodType: person.bloodType,
            allergies: person.allergies,
          },
        })
      : await prisma.patient.create({
          data: {
            userId: user.id,
            dateOfBirth: makeDateOfBirth(i),
            gender: person.gender,
            address: `Purok ${1 + (i % 8)}, Barangay Iponan, Cagayan de Oro City`,
            emergencyContact: `Emergency Contact ${idx} - 0918${String(5000000 + idx).padStart(7, '0')}`,
            bloodType: person.bloodType,
            allergies: person.allergies,
          },
        });
    if (!existingPatient) createdPatients++;

    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        patientId: patient.id,
        notes: { startsWith: '[SAMPLE]' },
      },
    });
    if (!existingAppointment) {
      const appointmentDate = makeAppointmentDate(i);
      const reason = REASONS[i % REASONS.length];
      const appointment = await prisma.appointment.create({
        data: {
          patientId: patient.id,
          doctorId: doctor.id,
          date: appointmentDate,
          time: appointmentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          reason,
          status: i % 3 === 0 ? 'CONFIRMED' : i % 4 === 0 ? 'COMPLETED' : 'PENDING',
          notes: `[SAMPLE] Generated appointment for testing dataset #${idx}`,
          intakeForm: {
            source: 'SAMPLE_SEED',
            patientInfo: { name: `${person.firstName} ${person.lastName}`, phone },
            reasons: reason,
          } as Prisma.InputJsonValue,
          consultationForm:
            i % 4 === 0
              ? ({
                  subjective: reason,
                  objective: 'Stable vital signs, no acute distress.',
                  assessment: DIAGNOSES[i % DIAGNOSES.length],
                  plan: 'Hydration, rest, and follow-up after 1 week.',
                } as Prisma.InputJsonValue)
              : Prisma.DbNull,
        },
      });
      createdAppointments++;

      await prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Sample Appointment Added',
          message: `Your sample appointment for ${appointment.date.toLocaleDateString()} has been generated.`,
          type: 'APPOINTMENT',
        },
      });
      createdNotifications++;
    }

    const existingRecord = await prisma.medicalRecord.findFirst({
      where: {
        patientId: patient.id,
        notes: { startsWith: '[SAMPLE]' },
      },
    });
    if (!existingRecord) {
      await prisma.medicalRecord.create({
        data: {
          patientId: patient.id,
          visitDate: new Date(),
          chiefComplaint: REASONS[i % REASONS.length],
          diagnosis: DIAGNOSES[i % DIAGNOSES.length],
          treatment: 'Oral rehydration, symptomatic treatment, and monitoring.',
          prescription: 'Paracetamol 500mg every 6 hours as needed.',
          vitalSignsJson: {
            bloodPressure: `${110 + (i % 20)}/${70 + (i % 10)}`,
            heartRate: 72 + (i % 20),
            temperature: 36.5 + ((i % 5) * 0.2),
            oxygenSaturation: 97 + (i % 3),
          } as Prisma.InputJsonValue,
          labResults: 'No lab request at this time.',
          attachments: [] as Prisma.InputJsonValue,
          notes: `[SAMPLE] Complete consultation note for patient dataset #${idx}.`,
        },
      });
      createdRecords++;
    }

    const existingVitals = await prisma.vitalSign.findFirst({
      where: {
        patientId: patient.id,
        notes: { startsWith: '[SAMPLE]' },
      },
    });
    if (!existingVitals) {
      await prisma.vitalSign.create({
        data: {
          patientId: patient.id,
          recordedById: doctor.id,
          bloodPressure: `${108 + (i % 22)}/${68 + (i % 12)}`,
          heartRate: 70 + (i % 25),
          temperature: 36.4 + ((i % 6) * 0.2),
          weight: 52 + (i % 25),
          height: 148 + (i % 25),
          respiratoryRate: 16 + (i % 6),
          oxygenSaturation: 96 + (i % 4),
          notes: `[SAMPLE] Baseline vitals for patient dataset #${idx}.`,
        },
      });
      createdVitals++;
    }
  }

  console.log('Sample seed complete:');
  console.log(`- Patient profiles created: ${createdPatients}`);
  console.log(`- Appointments created: ${createdAppointments}`);
  console.log(`- Medical records created: ${createdRecords}`);
  console.log(`- Vital signs created: ${createdVitals}`);
  console.log(`- Notifications created: ${createdNotifications}`);
}

main()
  .catch((error) => {
    console.error('Sample seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
