import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri('email-tracker-test');
});

afterAll(async () => {
  await mongod.stop();
});

describe('POST /api/emails', () => {
  it('creates a TrackedEmail and returns its id', async () => {
    const { POST } = await import('../app/api/emails/route.js');
    const { TrackedEmail } = await import('../lib/models/TrackedEmail.js');

    const req = new Request('http://localhost/api/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: 'Follow-up to Priya' }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(json.id).toBeDefined();

    const saved = await TrackedEmail.findById(json.id);
    expect(saved.label).toBe('Follow-up to Priya');
  });

  it('creates a TrackedEmail with no label when the body omits it', async () => {
    const { POST } = await import('../app/api/emails/route.js');

    const req = new Request('http://localhost/api/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(json.id).toBeDefined();
  });
});
