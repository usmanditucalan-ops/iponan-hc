import axios from "axios";

const API_TOKEN = process.env.IPROGSMS_API_TOKEN!;
const SMS_URL = process.env.IPROGSMS_SMS_URL!;
const OTP_URL = process.env.IPROGSMS_OTP_URL!;

/**
 * Normalize PH phone numbers
 */
const normalizePhoneForIprog = (phone: string): string => {
  return phone.replace(/[^\d]/g, "");
};

export const iprogSmsService = {
  /**
   * Send normal SMS
   */
  sendSms: async (to: string, message: string) => {
    const phone = normalizePhoneForIprog(to);

    try {
      const res = await axios.post(
        SMS_URL,
        null,
        {
          params: {
            api_token: API_TOKEN,
            phone_number: phone,
            message: message,
          },
        }
      );

      console.log(`IPROGSMS SMS sent to ${phone}`, res.data);
      return res.data;
    } catch (error: any) {
      console.error("IPROGSMS SMS ERROR:", error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Send OTP (IPROGSMS generates OTP)
   */
  sendOtp: async (to: string) => {
    const phone = normalizePhoneForIprog(to);

    try {
      const res = await axios.post(
        OTP_URL,
        null,
        {
          params: {
            api_token: API_TOKEN,
            phone_number: phone,
          },
        }
      );

      console.log(`IPROGSMS OTP sent to ${phone}`, res.data);
      return res.data;
    } catch (error: any) {
      console.error("IPROGSMS OTP ERROR:", error.response?.data || error.message);
      throw error;
    }
  },
};