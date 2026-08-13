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

describe('getEmailsWithStats', () => {
  it('returns emails newest-first with open count and last-opened timestamp', async () => {
    const { TrackedEmail } = await import('../lib/models/TrackedEmail.js');
    const { OpenEvent } = await import('../lib/models/OpenEvent.js');
    const { getEmailsWithStats } = await import('../lib/emailStats.js');

    const older = await TrackedEmail.create({ label: 'Older email' });
    await new Promise((r) => setTimeout(r, 10));
    const newer = await TrackedEmail.create({ label: 'Newer email' });

    await OpenEvent.create({ trackedEmailId: older._id, openedAt: new Date('2026-01-01T10:00:00Z') });
    await OpenEvent.create({ trackedEmailId: older._id, openedAt: new Date('2026-01-02T10:00:00Z') });

    const stats = await getEmailsWithStats();

    expect(stats[0].id).toBe(newer._id.toString());
    expect(stats[0].openCount).toBe(0);
    expect(stats[0].lastOpenedAt).toBeNull();

    expect(stats[1].id).toBe(older._id.toString());
    expect(stats[1].openCount).toBe(2);
    expect(stats[1].lastOpenedAt.toISOString()).toBe('2026-01-02T10:00:00.000Z');
    expect(stats[1].opens.length).toBe(2);
  });
});
