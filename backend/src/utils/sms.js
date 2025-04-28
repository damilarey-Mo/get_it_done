const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

exports.sendSMS = async (phoneNumber, message) => {
  try {
    // Format phone number to E.164 format if needed
    const formattedNumber = phoneNumber.startsWith('+') 
      ? phoneNumber 
      : `+${phoneNumber.replace(/\D/g, '')}`;

    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedNumber
    });

    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw new Error('Failed to send SMS');
  }
};

// Generate and send OTP
exports.sendOTP = async (phoneNumber) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const message = `Your Get It Done verification code is: ${otp}`;
    
    await exports.sendSMS(phoneNumber, message);
    return otp;
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Failed to send OTP');
  }
}; 