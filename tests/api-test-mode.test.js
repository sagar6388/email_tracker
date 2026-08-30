import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri('email-tracker-test');
  const { connectDB } = await import('../lib/db.js');
  await connectDB();
});

afterAll(async () => {
  await mongod.stop();
});

describe('POST /api/test-mode', () => {
  it('creates a TestSession expiring 3 minutes from now', async () => {
    const { POST } = await import('../app/api/test-mode/route.js');
    const { TestSession } = await import('../lib/models/TestSession.js');

    const before = Date.now();
    const res = await POST();
    const json = await res.json();
    const after = Date.now();

    expect(json.expiresAt).toBeDefined();
    const expiresAtMs = new Date(json.expiresAt).getTime();
    expect(expiresAtMs).toBeGreaterThanOrEqual(before + 179000);
    expect(expiresAtMs).toBeLessThanOrEqual(after + 181000);

    const sessions = await TestSession.find();
    expect(sessions.length).toBe(1);
  });
});
