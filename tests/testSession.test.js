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

describe('TestSession model', () => {
  it('creates a document with startedAt and expiresAt', async () => {
    const { TestSession } = await import('../lib/models/TestSession.js');
    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + 180000);
    const doc = await TestSession.create({ startedAt, expiresAt });
    expect(doc._id).toBeDefined();
    expect(doc.startedAt.toISOString()).toBe(startedAt.toISOString());
    expect(doc.expiresAt.toISOString()).toBe(expiresAt.toISOString());
  });

  it('rejects a document with no startedAt or expiresAt', async () => {
    const { TestSession } = await import('../lib/models/TestSession.js');
    await expect(TestSession.create({})).rejects.toThrow();
  });
});
