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

describe('GET /api/track/open/[id]', () => {
  it('logs an OpenEvent and returns the tracking pixel for a known id', async () => {
    const { GET } = await import('../app/api/track/open/[id]/route.js');
    const { TrackedEmail } = await import('../lib/models/TrackedEmail.js');
    const { OpenEvent } = await import('../lib/models/OpenEvent.js');
    const { TRANSPARENT_GIF } = await import('../lib/pixel.js');

    const email = await TrackedEmail.create({ label: 'Test' });

    const req = new Request(`http://localhost/api/track/open/${email._id}`, {
      headers: { 'x-forwarded-for': '9.9.9.9', 'user-agent': 'TestAgent/1.0' },
    });

    const res = await GET(req, { params: Promise.resolve({ id: email._id.toString() }) });

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('image/gif');
    const body = Buffer.from(await res.arrayBuffer());
    expect(body.equals(TRANSPARENT_GIF)).toBe(true);

    const events = await OpenEvent.find({ trackedEmailId: email._id });
    expect(events.length).toBe(1);
    expect(events[0].ip).toBe('9.9.9.9');
    expect(events[0].userAgent).toBe('TestAgent/1.0');
  });

  it('returns the pixel without logging when the id does not exist', async () => {
    const { GET } = await import('../app/api/track/open/[id]/route.js');
    const { OpenEvent } = await import('../lib/models/OpenEvent.js');
    const mongoose = (await import('mongoose')).default;

    const fakeId = new mongoose.Types.ObjectId().toString();
    const req = new Request(`http://localhost/api/track/open/${fakeId}`);
    const res = await GET(req, { params: Promise.resolve({ id: fakeId }) });

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('image/gif');
    const events = await OpenEvent.find({ trackedEmailId: fakeId });
    expect(events.length).toBe(0);
  });

  it('returns the pixel without throwing when the id is malformed', async () => {
    const { GET } = await import('../app/api/track/open/[id]/route.js');
    const req = new Request('http://localhost/api/track/open/not-a-valid-id');
    const res = await GET(req, { params: Promise.resolve({ id: 'not-a-valid-id' }) });

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('image/gif');
  });
});
