// app/api/track/open/[id]/route.js
import { connectDB } from '@/lib/db';
import { TrackedEmail } from '@/lib/models/TrackedEmail';
import { OpenEvent } from '@/lib/models/OpenEvent';
import { pixelResponse } from '@/lib/pixel';

export async function GET(req, context) {
  const { id } = await context.params;

  try {
    await connectDB();
    const email = await TrackedEmail.findById(id);
    if (email) {
      await OpenEvent.create({
        trackedEmailId: email._id,
        ip: req.headers.get('x-forwarded-for') ?? '',
        userAgent: req.headers.get('user-agent') ?? '',
      });
    }
  } catch (err) {
    console.error('track/open failed:', err.message);
  }

  return pixelResponse();
}
