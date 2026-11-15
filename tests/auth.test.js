import { describe, it, expect } from 'vitest';
import { verifyPassword, verifyToken, getExpectedToken } from '../lib/auth.js';

describe('Admin Authentication', () => {
  it('verifies correct admin password', () => {
    expect(verifyPassword('astroveda2026')).toBe(true);
    expect(verifyPassword('wrongpassword')).toBe(false);
    expect(verifyPassword('')).toBe(false);
    expect(verifyPassword(null)).toBe(false);
  });

  it('validates session token generated with salt', () => {
    const token = getExpectedToken();
    expect(token).toBeDefined();
    expect(token.length).toBe(64); // sha256 hex
    expect(verifyToken(token)).toBe(true);
    expect(verifyToken('fake-token')).toBe(false);
    expect(verifyToken('')).toBe(false);
  });
});
