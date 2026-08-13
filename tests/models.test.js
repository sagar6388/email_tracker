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

describe('TrackedEmail model', () => {
  it('creates a document with an optional label and a default createdAt', async () => {
    const { TrackedEmail } = await import('../lib/models/TrackedEmail.js');
    const doc = await TrackedEmail.create({ label: 'Follow-up to Priya' });
    expect(doc._id).toBeDefined();
    expect(doc.label).toBe('Follow-up to Priya');
    expect(doc.createdAt).toBeInstanceOf(Date);
  });

  it('allows creating a document with no label', async () => {
    const { TrackedEmail } = await import('../lib/models/TrackedEmail.js');
    const doc = await TrackedEmail.create({});
    expect(doc._id).toBeDefined();
    expect(doc.label).toBeUndefined();
  });
});

describe('OpenEvent model', () => {
  it('requires trackedEmailId and defaults openedAt to now', async () => {
    const { TrackedEmail } = await import('../lib/models/TrackedEmail.js');
    const { OpenEvent } = await import('../lib/models/OpenEvent.js');
    const email = await TrackedEmail.create({ label: 'Test' });
    const event = await OpenEvent.create({
      trackedEmailId: email._id,
      ip: '1.2.3.4',
      userAgent: 'TestAgent/1.0',
    });
    expect(event._id).toBeDefined();
    expect(event.trackedEmailId.toString()).toBe(email._id.toString());
    expect(event.openedAt).toBeInstanceOf(Date);
  });

  it('rejects an OpenEvent with no trackedEmailId', async () => {
    const { OpenEvent } = await import('../lib/models/OpenEvent.js');
    await expect(
      OpenEvent.create({ ip: '1.2.3.4', userAgent: 'TestAgent/1.0' })
    ).rejects.toThrow();
  });
});
