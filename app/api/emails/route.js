// app/api/emails/route.js
import { connectDB } from '@/lib/db';
import { TrackedEmail } from '@/lib/models/TrackedEmail';

export async function POST(req) {
  await connectDB();

  const body = await req.json().catch(() => ({}));
  const label = typeof body.label === 'string' && body.label.trim() ? body.label.trim() : undefined;

  const email = await TrackedEmail.create({ label });

  return Response.json({ id: email._id.toString() });
}
