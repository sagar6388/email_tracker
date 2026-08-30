// app/api/test-mode/route.js
import { connectDB } from '@/lib/db';
import { TestSession } from '@/lib/models/TestSession';

const TEST_MODE_DURATION_MS = 3 * 60 * 1000;

export async function POST() {
  await connectDB();

  const startedAt = new Date();
  const expiresAt = new Date(startedAt.getTime() + TEST_MODE_DURATION_MS);
  await TestSession.create({ startedAt, expiresAt });

  return Response.json({ expiresAt: expiresAt.toISOString() });
}
