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

describe('DELETE /api/emails/[id]', () => {
  it('deletes a TrackedEmail, its OpenEvents, and its ClickEvents', async () => {
    const { DELETE } = await import('../app/api/emails/[id]/route.js');
    const { TrackedEmail } = await import('../lib/models/TrackedEmail.js');
    const { OpenEvent } = await import('../lib/models/OpenEvent.js');
    const { ClickEvent } = await import('../lib/models/ClickEvent.js');

    const email = await TrackedEmail.create({ label: 'To delete' });
    await OpenEvent.create({ trackedEmailId: email._id });
    await OpenEvent.create({ trackedEmailId: email._id });
    await ClickEvent.create({ trackedEmailId: email._id, destination: 'https://example.com' });

    const req = new Request(`http://localhost/api/emails/${email._id}`, { method: 'DELETE' });
    const res = await DELETE(req, { params: Promise.resolve({ id: email._id.toString() }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);

    const remainingEmail = await TrackedEmail.findById(email._id);
    expect(remainingEmail).toBeNull();
    const remainingOpens = await OpenEvent.find({ trackedEmailId: email._id });
    expect(remainingOpens.length).toBe(0);
    const remainingClicks = await ClickEvent.find({ trackedEmailId: email._id });
    expect(remainingClicks.length).toBe(0);
  });

  it('returns 400 without throwing when the id is malformed', async () => {
    const { DELETE } = await import('../app/api/emails/[id]/route.js');
    const req = new Request('http://localhost/api/emails/not-a-valid-id', { method: 'DELETE' });
    const res = await DELETE(req, { params: Promise.resolve({ id: 'not-a-valid-id' }) });
    expect(res.status).toBe(400);
  });
});
