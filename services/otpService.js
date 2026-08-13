const nodemailer = require('nodemailer');
 
// 1. Mailtrap Transporter (Fallback for slow/failed deliveries)
const mailtrapTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT, 10) || 2525,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
 
// 2. Real Gmail Transporter (Primary Sender)
const gmailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS,
  },
});
 
/**
* Strict Timeout Wrapper:
* Forces the transporter to fail if delivery takes longer than timeoutMs (5 seconds).
*/
function sendMailWithStrictTimeout(transporter, mailOptions, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    let settled = false;
 
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error(`Delivery timed out after ${timeoutMs}ms`));
      }
    }, timeoutMs);
 
    transporter.sendMail(mailOptions)
      .then((info) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(info);
        }
      })
      .catch((err) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          reject(err);
        }
      });
  });
}
 
// Helper: Dispatch Email OTP
async function sendEmailOTP(toEmail, otp) {
  const normalizedEmail = String(toEmail).toLowerCase().trim();
 
  // Template for Real Email
  const realMailOptions = {
    from: `"Stackly" <${process.env.GMAIL_USER}>`,
    to: normalizedEmail,
    subject: 'Stackly - Verification Code',
    html: `
<div style="font-family: Arial, sans-serif; padding: 20px;">
<h2>Stackly Verification</h2>
<p>Your verification code is: <b style="font-size: 20px; color: #4CAF50;">${otp}</b></p>
<p>This code will expire in 1 minute.</p>
</div>
    `,
  };
 
  // Template for Mailtrap Fallback
  const fallbackMailOptions = {
    from: '"Stackly Sandbox" <noreplystackly@gmail.com>',
    to: normalizedEmail,
    subject: 'Stackly - Verification Code (Mailtrap Sandbox)',
    html: `
<div style="font-family: Arial, sans-serif; padding: 20px;">
<h2>Stackly Verification (Mailtrap Sandbox)</h2>
<p>Your verification code is: <b style="font-size: 20px; color: #2196F3;">${otp}</b></p>
<p>This code will expire in 1 minute.</p>
</div>
    `,
  };
 
  // -------------------------------------------------------------------
  // TRY GMAIL FIRST (5-Second Strict Cutoff)
  // -------------------------------------------------------------------
  try {
    await sendMailWithStrictTimeout(gmailTransporter, realMailOptions, 5000);
    console.log(`[REAL GMAIL INBOX] Delivered to inbox within 5s: ${normalizedEmail}`);
  } catch (error) {
    // -------------------------------------------------------------------
    // FALLBACK TO MAILTRAP IF GMAIL FAILS OR TAKES > 5 SECONDS
    // -------------------------------------------------------------------
    console.warn(`[GMAIL TIMED OUT/FAILED] (${error.message}). Redirecting to Mailtrap...`);
    try {
      await mailtrapTransporter.sendMail(fallbackMailOptions);
      console.log(`[MAILTRAP FALLBACK] Delivered to Mailtrap sandbox for: ${normalizedEmail}`);
    } catch (fallbackError) {
      console.error(`[FATAL] Mailtrap fallback failed:`, fallbackError.message);
    }
  }
}
 
// Helper: Dispatch SMS OTP
async function sendSmsOTP(toPhone, otp) {
  const provider = process.env.SMS_PROVIDER || 'mock';
 
  if (provider === 'mock') {
    console.log(`\n==========================================`);
    console.log(`[MOCK SMS] OTP Dispatched`);
    console.log(`Phone    : ${toPhone}`);
    console.log(`OTP Code : ${otp}`);
    console.log(`==========================================\n`);
  } else if (provider === 'twilio') {
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
      body: `Your Stackly OTP code is: ${otp}`,
      from: process.env.TWILIO_FROM_NUMBER,
      to: toPhone,
    });
  }
}
 
module.exports = { sendEmailOTP, sendSmsOTP };