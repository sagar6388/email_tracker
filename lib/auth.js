// lib/auth.js
import crypto from 'crypto';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'astroveda2026';
const AUTH_SECRET = process.env.AUTH_SECRET || 'astroveda-secret-salt-key-9838';

export function getExpectedToken() {
  return crypto.createHmac('sha256', AUTH_SECRET).update(ADMIN_PASSWORD).digest('hex');
}

export function verifyPassword(password) {
  if (!password) return false;
  return password.trim() === ADMIN_PASSWORD;
}

export function verifyToken(token) {
  if (!token) return false;
  return token === getExpectedToken();
}
