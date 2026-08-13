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

describe('connectDB', () => {
  it('connects to MongoDB and caches the connection', async () => {
    const { connectDB } = await import('../lib/db.js');
    const conn1 = await connectDB();
    const conn2 = await connectDB();
    expect(conn1).toBe(conn2);
    expect(conn1.connection.readyState).toBe(1);
  });
});
