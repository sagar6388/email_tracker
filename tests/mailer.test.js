import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const sendMailMock = vi.fn().mockResolvedValue({ messageId: 'abc123' });
const createTransportMock = vi.fn().mockReturnValue({ sendMail: sendMailMock });

vi.mock('nodemailer', () => ({
  default: { createTransport: (...args) => createTransportMock(...args) },
}));

describe('sendMail', () => {
  const originalUser = process.env.GMAIL_USER;
  const originalPass = process.env.GMAIL_APP_PASSWORD;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GMAIL_USER = 'me@gmail.com';
    process.env.GMAIL_APP_PASSWORD = 'app-password';
  });

  afterEach(() => {
    process.env.GMAIL_USER = originalUser;
    process.env.GMAIL_APP_PASSWORD = originalPass;
  });

  it('sends via a Gmail transporter using env credentials', async () => {
    const { sendMail } = await import('../lib/mailer.js');
    await sendMail({ to: 'her@example.com', subject: 'Hi', html: '<p>hi</p>' });

    expect(createTransportMock).toHaveBeenCalledWith({
      service: 'gmail',
      auth: { user: 'me@gmail.com', pass: 'app-password' },
    });
    expect(sendMailMock).toHaveBeenCalledWith({
      from: 'me@gmail.com',
      to: 'her@example.com',
      subject: 'Hi',
      html: '<p>hi</p>',
    });
  });

  it('throws when GMAIL_USER or GMAIL_APP_PASSWORD is missing', async () => {
    delete process.env.GMAIL_USER;
    delete process.env.GMAIL_APP_PASSWORD;
    const { sendMail } = await import('../lib/mailer.js');
    await expect(sendMail({ to: 'her@example.com', subject: 'Hi', html: '<p>hi</p>' })).rejects.toThrow();
  });
});
