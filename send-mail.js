// send-mail.js
// Standalone script to send the AstroVeda personal feedback email using Resend API (or Gmail fallback)
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

// 1. Load .env.local manually
function loadEnv() {
  const envPath = path.resolve(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const RECIPIENT = 'reenachaurasia225@gmail.com';
const SUBJECT = 'Mehnat ke baad bhi rukawat?';

const EMAIL_CONTENT = `Namaste,

Kabhi lagta hai ki mehnat poori hai, phir bhi career me baat aage nahi badh rahi? Aksar Kundli me iska ek kaaran dikhta hai.

Aap 2022 me AstroVeda se jude the. Ab naye roop me aap apni Kundli ek baar dobara dekh sakte hain.

Telegram par @AstroVedaOfficial_bot search karke Start dabayein.

Acharya Sarvesh Tiwari
AstroVeda.`;

async function main() {
  console.log('--------------------------------------------------');
  console.log('Sending email to:', RECIPIENT);
  console.log('Subject:', SUBJECT);
  console.log('--------------------------------------------------');

  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey) {
    console.log('Attempting delivery via Resend API...');
    try {
      const fromAddress = process.env.RESEND_FROM || 'Acharya Sarvesh Tiwari <onboarding@resend.dev>';
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [RECIPIENT],
          subject: SUBJECT,
          text: EMAIL_CONTENT,
        }),
      });

      const resData = await res.json();

      if (res.ok) {
        console.log(' SUCCESS: Email sent via Resend API!');
        console.log('Resend Email ID:', resData.id);
        return;
      }

      console.warn(' Resend API Warning/Error:', resData.message || resData);

      // Check for Resend testing domain restriction
      if (resData.name === 'validation_error' && resData.message?.includes('testing emails')) {
        console.log('\nNOTE: Resend requires a verified domain to send to external recipients.');
        console.log('Switching to configured Gmail account to ensure delivery...\n');
      }
    } catch (err) {
      console.warn('Resend Network Error:', err.message);
    }
  }

  // Gmail Fallback
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    console.log('Delivering via Gmail (' + process.env.GMAIL_USER + ')...');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: `"Acharya Sarvesh Tiwari" <${process.env.GMAIL_USER}>`,
      to: RECIPIENT,
      subject: SUBJECT,
      text: EMAIL_CONTENT,
    });

    console.log(' SUCCESS: Email sent via Gmail SMTP!');
    console.log('Message ID:', info.messageId);
    return;
  }

  console.error(' ERROR: Could not send email. Please check your credentials in .env.local.');
}

main().catch(console.error);
