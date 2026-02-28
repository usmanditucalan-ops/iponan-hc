import axios from 'axios';
import { iprogSmsService } from './iprogSmsService';

// Brevo Config
const brevoApiKey = process.env.BREVO_API_KEY || '';
const senderEmail = process.env.BREVO_SENDER_EMAIL || '';
const senderName = process.env.BREVO_SENDER_NAME || 'Barangay Iponan Health Clinic';

const CLINIC_NAME = 'Barangay Iponan Health Clinic';

// ---- Helpers ----

/**
 * Normalizes phone numbers to E.164 format.
 * Specifically handles Philippines mobile numbers starting with 09 or 9.
 */
const normalizePhone = (phone: string): string => {
  // Remove non-digit characters except for '+'
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // If it's already in E.164 format, return it
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  
  // Handle PH mobile numbers: 09XXXXXXXXX -> +639XXXXXXXXX
  if (cleaned.startsWith('09') && cleaned.length === 11) {
    return '+63' + cleaned.substring(1);
  }
  
  // Handle PH mobile numbers: 9XXXXXXXXX -> +639XXXXXXXXX
  if (cleaned.startsWith('9') && cleaned.length === 10) {
    return '+63' + cleaned;
  }
  
  return cleaned;
};

// ---- Base Senders ----

const sendSmsInternal = async (to: string, body: string) => {
  try {
    await iprogSmsService.sendSms(to, body);
  } catch (err: any) {
    console.warn(`[SMS Warning] Failed to send SMS to ${to}. Execution will continue to prevent UI blockages.`);
  }
};

const sendEmailInternal = async (toEmail: string, toName: string, subject: string, htmlContent: string) => {
  if (!brevoApiKey) {
    console.log(`[Brevo Mock] To: ${toEmail} | Subject: ${subject}`);
    return;
  }
  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { name: senderName, email: senderEmail },
        to: [{ email: toEmail, name: toName }],
        subject,
        htmlContent
      },
      {
        headers: {
          'api-key': brevoApiKey,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`Brevo Email sent to ${toEmail}: ${response.data.messageId}`);
  } catch (error) {
    console.error('Brevo Email error:', error);
  }
};

// ---- Exposed Lifecycle Methods ----

export const NotificationService = {
  /**
   * EVENT: Login Forgot Password
   * CHANNEL: SMS only
   */
  sendOtpSms: async (phone: string, otp: string) => {
    // Note: IPROGSMS handles the message template formatting internally based on the new service definition.
    await iprogSmsService.sendOtp(phone);
  },

  /**
   * EVENT: Appointment Created
   * CHANNEL: Email + SMS
   * CONTENT: Date, time, clinic name only
   */
  sendAppointmentCreated: async (patient: any, appointment: any) => {
    const dateStr = new Date(appointment.date).toLocaleDateString();
    
    // SMS
    if (patient.phone) {
      const smsBody = `Your appointment at ${CLINIC_NAME} has been received for ${dateStr} at ${appointment.time}.`;
      await sendSmsInternal(patient.phone, smsBody);
    }
    
    // Email
    if (patient.email) {
      const emailBody = `
        <p>Hello ${patient.firstName},</p>
        <p>Your appointment request has been received by <strong>${CLINIC_NAME}</strong>.</p>
        <p><strong>Details:</strong></p>
        <ul>
          <li>Date: ${dateStr}</li>
          <li>Time: ${appointment.time}</li>
        </ul>
        <p>We will notify you once your appointment is confirmed.</p>
      `;
      await sendEmailInternal(patient.email, `${patient.firstName} ${patient.lastName}`, `Appointment Request - ${CLINIC_NAME}`, emailBody);
    }
  },

  /**
   * EVENT: Appointment Confirmed
   * CHANNEL: Email + SMS
   */
  sendAppointmentConfirmed: async (patient: any, appointment: any) => {
    const dateStr = new Date(appointment.date).toLocaleDateString();

    // SMS
    if (patient.phone) {
      const smsBody = `Your appointment at ${CLINIC_NAME} for ${dateStr} at ${appointment.time} is CONFIRMED.`;
      await sendSmsInternal(patient.phone, smsBody);
    }

    // Email
    if (patient.email) {
      const emailBody = `
        <p>Hello ${patient.firstName},</p>
        <p>Your appointment at <strong>${CLINIC_NAME}</strong> has been <strong>CONFIRMED</strong>.</p>
        <p><strong>Details:</strong></p>
        <ul>
          <li>Date: ${dateStr}</li>
          <li>Time: ${appointment.time}</li>
        </ul>
        <p>Please arrive early. Thank you.</p>
      `;
      await sendEmailInternal(patient.email, `${patient.firstName} ${patient.lastName}`, `Appointment Confirmed - ${CLINIC_NAME}`, emailBody);
    }
  },

  /**
   * EVENT: Appointment Rescheduled
   * CHANNEL: Email + SMS
   * CONTENT: Old date/time + new date/time
   */
  sendAppointmentRescheduled: async (patient: any, oldAppointment: any, newAppointment: any) => {
    const oldDateStr = new Date(oldAppointment.date).toLocaleDateString();
    const newDateStr = new Date(newAppointment.date).toLocaleDateString();

    // SMS
    if (patient.phone) {
      const smsBody = `Your ${CLINIC_NAME} appointment was RESCHEDULED from ${oldDateStr} ${oldAppointment.time} to ${newDateStr} ${newAppointment.time}.`;
      await sendSmsInternal(patient.phone, smsBody);
    }

    // Email
    if (patient.email) {
      const emailBody = `
        <p>Hello ${patient.firstName},</p>
        <p>Your appointment at <strong>${CLINIC_NAME}</strong> has been <strong>RESCHEDULED</strong>.</p>
        <p><strong>Previous Details:</strong></p>
        <ul>
          <li>Date: ${oldDateStr}</li>
          <li>Time: ${oldAppointment.time}</li>
        </ul>
        <p><strong>New Details:</strong></p>
        <ul>
          <li>Date: ${newDateStr}</li>
          <li>Time: ${newAppointment.time}</li>
        </ul>
      `;
      await sendEmailInternal(patient.email, `${patient.firstName} ${patient.lastName}`, `Appointment Rescheduled - ${CLINIC_NAME}`, emailBody);
    }
  },

  /**
   * EVENT: Appointment Cancelled
   * CHANNEL: Email + SMS
   */
  sendAppointmentCancelled: async (patient: any, appointment: any) => {
    const dateStr = new Date(appointment.date).toLocaleDateString();

    // SMS
    if (patient.phone) {
      const smsBody = `Your appointment at ${CLINIC_NAME} for ${dateStr} at ${appointment.time} has been CANCELLED.`;
      await sendSmsInternal(patient.phone, smsBody);
    }

    // Email
    if (patient.email) {
      const emailBody = `
        <p>Hello ${patient.firstName},</p>
        <p>We are writing to confirm that your appointment at <strong>${CLINIC_NAME}</strong> on ${dateStr} at ${appointment.time} has been <strong>CANCELLED</strong>.</p>
        <p>If you believe this is an error, please contact the clinic or book a new appointment via the app.</p>
      `;
      await sendEmailInternal(patient.email, `${patient.firstName} ${patient.lastName}`, `Appointment Cancelled - ${CLINIC_NAME}`, emailBody);
    }
  },

  /**
   * EVENT: Patient EMR Available in Portal
   * CHANNEL: Email only
   * CONTENT: "You may now view your medical record in the patient portal" NO MEDICAL DETAILS
   */
  sendEmrAvailableEmail: async (patient: any) => {
    // Email Only per rules
    if (patient.email) {
      const emailBody = `
        <p>Hello ${patient.firstName},</p>
        <p>You may now view your medical record in the patient portal.</p>
        <br />
        <p>Thank you,<br />${CLINIC_NAME}</p>
      `;
      await sendEmailInternal(patient.email, `${patient.firstName} ${patient.lastName}`, `Medical Record Available - ${CLINIC_NAME}`, emailBody);
    }
  }
};
