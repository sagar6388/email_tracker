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

describe('GET /api/track/click/[id]', () => {
  it('logs a ClickEvent and redirects to the destination for a known id', async () => {
    const { GET } = await import('../app/api/track/click/[id]/route.js');
    const { TrackedEmail } = await import('../lib/models/TrackedEmail.js');
    const { ClickEvent } = await import('../lib/models/ClickEvent.js');

    const email = await TrackedEmail.create({ label: 'Test' });
    const dest = 'https://example.com/portfolio';

    const req = new Request(
      `http://localhost/api/track/click/${email._id}?to=${encodeURIComponent(dest)}`,
      { headers: { 'x-forwarded-for': '9.9.9.9', 'user-agent': 'TestAgent/1.0' } }
    );

    const res = await GET(req, { params: Promise.resolve({ id: email._id.toString() }) });

    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe(dest);

    const clicks = await ClickEvent.find({ trackedEmailId: email._id });
    expect(clicks.length).toBe(1);
    expect(clicks[0].ip).toBe('9.9.9.9');
    expect(clicks[0].userAgent).toBe('TestAgent/1.0');
    expect(clicks[0].destination).toBe(dest);
  });

  it('redirects without logging when the id does not exist', async () => {
    const { GET } = await import('../app/api/track/click/[id]/route.js');
    const { ClickEvent } = await import('../lib/models/ClickEvent.js');
    const mongoose = (await import('mongoose')).default;

    const fakeId = new mongoose.Types.ObjectId().toString();
    const dest = 'https://example.com/unknown';
    const req = new Request(`http://localhost/api/track/click/${fakeId}?to=${encodeURIComponent(dest)}`);
    const res = await GET(req, { params: Promise.resolve({ id: fakeId }) });

    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe(dest);
    const clicks = await ClickEvent.find({ trackedEmailId: fakeId });
    expect(clicks.length).toBe(0);
  });

  it('redirects without throwing when the id is malformed', async () => {
    const { GET } = await import('../app/api/track/click/[id]/route.js');
    const dest = 'https://example.com/malformed';
    const req = new Request(`http://localhost/api/track/click/not-a-valid-id?to=${encodeURIComponent(dest)}`);
    const res = await GET(req, { params: Promise.resolve({ id: 'not-a-valid-id' }) });

    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe(dest);
  });

  it('returns 400 when the destination is missing or unsafe', async () => {
    const { GET } = await import('../app/api/track/click/[id]/route.js');
    const mongoose = (await import('mongoose')).default;
    const fakeId = new mongoose.Types.ObjectId().toString();

    const reqNoTo = new Request(`http://localhost/api/track/click/${fakeId}`);
    const resNoTo = await GET(reqNoTo, { params: Promise.resolve({ id: fakeId }) });
    expect(resNoTo.status).toBe(400);

    const reqBadScheme = new Request(`http://localhost/api/track/click/${fakeId}?to=javascript:alert(1)`);
    const resBadScheme = await GET(reqBadScheme, { params: Promise.resolve({ id: fakeId }) });
    expect(resBadScheme.status).toBe(400);
  });
});
