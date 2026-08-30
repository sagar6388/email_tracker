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

describe('ClickEvent model', () => {
  it('requires trackedEmailId and defaults clickedAt to now', async () => {
    const { TrackedEmail } = await import('../lib/models/TrackedEmail.js');
    const { ClickEvent } = await import('../lib/models/ClickEvent.js');
    const email = await TrackedEmail.create({ label: 'Test' });
    const click = await ClickEvent.create({
      trackedEmailId: email._id,
      ip: '1.2.3.4',
      userAgent: 'TestAgent/1.0',
      destination: 'https://example.com',
    });
    expect(click._id).toBeDefined();
    expect(click.trackedEmailId.toString()).toBe(email._id.toString());
    expect(click.clickedAt).toBeInstanceOf(Date);
    expect(click.destination).toBe('https://example.com');
  });

  it('rejects a ClickEvent with no trackedEmailId', async () => {
    const { ClickEvent } = await import('../lib/models/ClickEvent.js');
    await expect(
      ClickEvent.create({ ip: '1.2.3.4', destination: 'https://example.com' })
    ).rejects.toThrow();
  });
});
