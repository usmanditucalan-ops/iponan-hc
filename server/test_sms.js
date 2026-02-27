const dotenv = require('dotenv');
const twilio = require('twilio');
const path = require('path');

// Load .env from the server directory
dotenv.config({ path: path.join(__dirname, '.env') });

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

console.log('AccountSid:', accountSid ? 'Loaded' : 'Missing');
console.log('AuthToken:', authToken ? 'Loaded' : 'Missing');
console.log('TwilioPhone:', twilioPhone);

const client = twilio(accountSid, authToken);

const normalizePhone = (phone) => {
  let cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.startsWith('09') && cleaned.length === 11) return '+63' + cleaned.substring(1);
  if (cleaned.startsWith('9') && cleaned.length === 10) return '+63' + cleaned;
  return cleaned;
};

const sendTestSms = async (to, body) => {
  const normalizedTo = normalizePhone(to);
  console.log(`Sending to: ${normalizedTo}`);
  try {
    const message = await client.messages.create({
      body,
      from: twilioPhone,
      to: normalizedTo
    });
    console.log('Success! Message SID:', message.sid);
  } catch (error) {
    console.error('Error:', error.message);
    if (error.code === 21608) {
      console.log('TIP: This is a Twilio Trial account error. You MUST verify the recipient number in the Twilio Console.');
    }
  }
};

// Use the phone number provided by the user
sendTestSms('09758053186', 'Test SMS from Barangay Iponan Health Clinic');
