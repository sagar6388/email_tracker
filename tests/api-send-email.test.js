import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';

const sendMailMock = vi.fn().mockResolvedValue({ messageId: 'abc123' });

vi.mock('@/lib/mailer', () => ({
  sendMail: (...args) => sendMailMock(...args),
}));

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri('email-tracker-test');
  const { connectDB } = await import('../lib/db.js');
  await connectDB();
});

beforeEach(() => {
  sendMailMock.mockClear();
  sendMailMock.mockResolvedValue({ messageId: 'abc123' });
});

afterAll(async () => {
  await mongod.stop();
});

describe('POST /api/send-email', () => {
  it('creates a TrackedEmail, sends via mailer with tracked pixel/button, and returns the id', async () => {
    const { POST } = await import('../app/api/send-email/route.js');
    const { TrackedEmail } = await import('../lib/models/TrackedEmail.js');

    const req = new Request('http://localhost/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', host: 'example.com' },
      body: JSON.stringify({
        to: 'her@example.com',
        subject: 'A small thing',
        label: 'Roses',
        eyebrow: 'a small thing, for you',
        message: 'I made something for you.',
        buttonText: 'Open It',
        buttonUrl: 'https://destination.example.com',
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.sent).toBe(true);
    expect(json.id).toBeDefined();

    const saved = await TrackedEmail.findById(json.id);
    expect(saved.label).toBe('Roses');

    expect(sendMailMock).toHaveBeenCalledTimes(1);
    const call = sendMailMock.mock.calls[0][0];
    expect(call.to).toBe('her@example.com');
    expect(call.subject).toBe('A small thing');
    expect(call.html).toContain(`https://example.com/api/track/open/${json.id}`);
    expect(call.html).toContain(`https://example.com/api/track/click/${json.id}`);
    expect(call.html).toContain(encodeURIComponent('https://destination.example.com'));
  });

  it('returns 400 when to or buttonUrl is missing', async () => {
    const { POST } = await import('../app/api/send-email/route.js');

    const req = new Request('http://localhost/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', host: 'example.com' },
      body: JSON.stringify({ subject: 'A small thing' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it('returns 502 without throwing when the mailer fails', async () => {
    sendMailMock.mockRejectedValueOnce(new Error('SMTP auth failed'));
    const { POST } = await import('../app/api/send-email/route.js');

    const req = new Request('http://localhost/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', host: 'example.com' },
      body: JSON.stringify({
        to: 'her@example.com',
        subject: 'A small thing',
        buttonUrl: 'https://destination.example.com',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(502);
    const json = await res.json();
    expect(json.sent).toBe(false);
  });
});
