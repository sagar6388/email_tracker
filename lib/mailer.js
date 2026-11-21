// lib/mailer.js
import nodemailer from 'nodemailer';

export async function sendMail({ to, subject, html, text, senderName }) {
  // 1. Try Resend API if RESEND_API_KEY is present
  if (process.env.RESEND_API_KEY) {
    try {
      const fromAddress = process.env.RESEND_FROM || (senderName?.trim()
        ? `"${senderName.trim()}" <onboarding@resend.dev>`
        : 'onboarding@resend.dev');

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: Array.isArray(to) ? to : [to],
          subject,
          html: html || undefined,
          text: text || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        return { messageId: data.id, resend: true, data };
      }
      console.warn('Resend API response error:', data);
      if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        throw new Error(data.message || 'Resend API failed to send email');
      }
      console.info('Falling back to Gmail SMTP...');
    } catch (err) {
      if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        throw err;
      }
      console.warn('Resend failed, falling back to Gmail:', err.message);
    }
  }

  // 2. Gmail SMTP via Nodemailer
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error('Missing RESEND_API_KEY or (GMAIL_USER & GMAIL_APP_PASSWORD) in .env.local');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const fromAddress = senderName?.trim()
    ? `"${senderName.trim()}" <${process.env.GMAIL_USER}>`
    : process.env.GMAIL_USER;

  const mailOptions = {
    from: fromAddress,
    to,
    subject,
    html,
  };

  if (text) {
    mailOptions.text = text;
  }

  return transporter.sendMail(mailOptions);
}
