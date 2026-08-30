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

describe('getEmailsWithStats — opens', () => {
  it('returns emails newest-first with open count and last-opened timestamp', async () => {
    const { TrackedEmail } = await import('../lib/models/TrackedEmail.js');
    const { OpenEvent } = await import('../lib/models/OpenEvent.js');
    const { getEmailsWithStats } = await import('../lib/emailStats.js');

    const older = await TrackedEmail.create({ label: 'Older email', createdAt: new Date('2026-01-01T00:00:00Z') });
    const newer = await TrackedEmail.create({ label: 'Newer email', createdAt: new Date('2026-01-01T01:00:00Z') });

    await OpenEvent.create({ trackedEmailId: older._id, openedAt: new Date('2026-01-01T10:00:00Z'), ip: '1.1.1.1', userAgent: 'UA1' });
    await OpenEvent.create({ trackedEmailId: older._id, openedAt: new Date('2026-01-02T10:00:00Z'), ip: '1.1.1.1', userAgent: 'UA1' });

    const stats = await getEmailsWithStats();

    expect(stats[0].id).toBe(newer._id.toString());
    expect(stats[0].openCount).toBe(0);
    expect(stats[0].lastOpenedAt).toBeNull();

    expect(stats[1].id).toBe(older._id.toString());
    expect(stats[1].openCount).toBe(2);
    expect(stats[1].lastOpenedAt.toISOString()).toBe('2026-01-02T10:00:00.000Z');
    expect(stats[1].opens.length).toBe(2);
    expect(stats[1].opens[0].ip).toBe('1.1.1.1');
    expect(stats[1].opens[0].userAgent).toBe('UA1');
  });

  it('classifies an open within 5 minutes of creation as automated', async () => {
    const { TrackedEmail } = await import('../lib/models/TrackedEmail.js');
    const { OpenEvent } = await import('../lib/models/OpenEvent.js');
    const { getEmailsWithStats } = await import('../lib/emailStats.js');

    const createdAt = new Date('2026-02-01T00:00:00Z');
    const email = await TrackedEmail.create({ label: 'Auto test', createdAt });
    await OpenEvent.create({ trackedEmailId: email._id, openedAt: new Date(createdAt.getTime() + 60000) });

    const stats = await getEmailsWithStats();
    const found = stats.find((e) => e.id === email._id.toString());
    expect(found.opens[0].classification).toBe('automated');
  });

  it('classifies an open inside an active test session as self-test, even within 5 minutes of creation', async () => {
    const { TrackedEmail } = await import('../lib/models/TrackedEmail.js');
    const { OpenEvent } = await import('../lib/models/OpenEvent.js');
    const { TestSession } = await import('../lib/models/TestSession.js');
    const { getEmailsWithStats } = await import('../lib/emailStats.js');

    const createdAt = new Date('2026-02-02T00:00:00Z');
    const email = await TrackedEmail.create({ label: 'Self test', createdAt });
    const openedAt = new Date(createdAt.getTime() + 30000);
    await OpenEvent.create({ trackedEmailId: email._id, openedAt });
    await TestSession.create({
      startedAt: new Date(openedAt.getTime() - 10000),
      expiresAt: new Date(openedAt.getTime() + 10000),
    });

    const stats = await getEmailsWithStats();
    const found = stats.find((e) => e.id === email._id.toString());
    expect(found.opens[0].classification).toBe('self-test');
  });

  it('classifies opens from two different emails at the exact same second as automated', async () => {
    const { TrackedEmail } = await import('../lib/models/TrackedEmail.js');
    const { OpenEvent } = await import('../lib/models/OpenEvent.js');
    const { getEmailsWithStats } = await import('../lib/emailStats.js');

    const emailA = await TrackedEmail.create({ label: 'A', createdAt: new Date('2026-03-01T00:00:00Z') });
    const emailB = await TrackedEmail.create({ label: 'B', createdAt: new Date('2026-03-01T00:00:00Z') });
    const sharedSecond = new Date('2026-03-05T12:00:00.100Z');
    await OpenEvent.create({ trackedEmailId: emailA._id, openedAt: sharedSecond });
    await OpenEvent.create({ trackedEmailId: emailB._id, openedAt: new Date('2026-03-05T12:00:00.900Z') });

    const stats = await getEmailsWithStats();
    const foundA = stats.find((e) => e.id === emailA._id.toString());
    const foundB = stats.find((e) => e.id === emailB._id.toString());
    expect(foundA.opens[0].classification).toBe('automated');
    expect(foundB.opens[0].classification).toBe('automated');
  });

  it('classifies a spaced-out open with no matching pattern as recipient', async () => {
    const { TrackedEmail } = await import('../lib/models/TrackedEmail.js');
    const { OpenEvent } = await import('../lib/models/OpenEvent.js');
    const { getEmailsWithStats } = await import('../lib/emailStats.js');

    const createdAt = new Date('2026-04-01T00:00:00Z');
    const email = await TrackedEmail.create({ label: 'Real open', createdAt });
    await OpenEvent.create({ trackedEmailId: email._id, openedAt: new Date('2026-04-02T09:00:00Z') });

    const stats = await getEmailsWithStats();
    const found = stats.find((e) => e.id === email._id.toString());
    expect(found.opens[0].classification).toBe('recipient');
  });
});

describe('getEmailsWithStats — clicks', () => {
  it('returns click count, last-clicked timestamp, and per-click ip/userAgent/destination', async () => {
    const { TrackedEmail } = await import('../lib/models/TrackedEmail.js');
    const { ClickEvent } = await import('../lib/models/ClickEvent.js');
    const { getEmailsWithStats } = await import('../lib/emailStats.js');

    const email = await TrackedEmail.create({ label: 'Click test', createdAt: new Date('2026-05-01T00:00:00Z') });
    await ClickEvent.create({
      trackedEmailId: email._id,
      clickedAt: new Date('2026-05-02T09:00:00Z'),
      ip: '2.2.2.2',
      userAgent: 'UA2',
      destination: 'https://example.com',
    });

    const stats = await getEmailsWithStats();
    const found = stats.find((e) => e.id === email._id.toString());
    expect(found.clickCount).toBe(1);
    expect(found.lastClickedAt.toISOString()).toBe('2026-05-02T09:00:00.000Z');
    expect(found.clicks[0].ip).toBe('2.2.2.2');
    expect(found.clicks[0].userAgent).toBe('UA2');
    expect(found.clicks[0].destination).toBe('https://example.com');
    expect(found.clicks[0].classification).toBe('recipient');
  });

  it('classifies a click within 5 minutes of creation as automated, independently of opens', async () => {
    const { TrackedEmail } = await import('../lib/models/TrackedEmail.js');
    const { ClickEvent } = await import('../lib/models/ClickEvent.js');
    const { getEmailsWithStats } = await import('../lib/emailStats.js');

    const createdAt = new Date('2026-06-01T00:00:00Z');
    const email = await TrackedEmail.create({ label: 'Click auto test', createdAt });
    await ClickEvent.create({ trackedEmailId: email._id, clickedAt: new Date(createdAt.getTime() + 60000), destination: 'https://x.com' });

    const stats = await getEmailsWithStats();
    const found = stats.find((e) => e.id === email._id.toString());
    expect(found.clicks[0].classification).toBe('automated');
  });

  it('classifies a click inside an active test session as self-test', async () => {
    const { TrackedEmail } = await import('../lib/models/TrackedEmail.js');
    const { ClickEvent } = await import('../lib/models/ClickEvent.js');
    const { TestSession } = await import('../lib/models/TestSession.js');
    const { getEmailsWithStats } = await import('../lib/emailStats.js');

    const createdAt = new Date('2026-06-02T00:00:00Z');
    const email = await TrackedEmail.create({ label: 'Click self test', createdAt });
    const clickedAt = new Date('2026-06-05T00:00:00Z');
    await ClickEvent.create({ trackedEmailId: email._id, clickedAt, destination: 'https://x.com' });
    await TestSession.create({
      startedAt: new Date(clickedAt.getTime() - 10000),
      expiresAt: new Date(clickedAt.getTime() + 10000),
    });

    const stats = await getEmailsWithStats();
    const found = stats.find((e) => e.id === email._id.toString());
    expect(found.clicks[0].classification).toBe('self-test');
  });
});
