// lib/mailer.js
import nodemailer from 'nodemailer';

export async function sendMail({ to, subject, html, senderName }) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error('Missing GMAIL_USER or GMAIL_APP_PASSWORD — set them in .env.local');
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

  return transporter.sendMail({
    from: fromAddress,
    to,
    subject,
    html,
  });
}
