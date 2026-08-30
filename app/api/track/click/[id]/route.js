// app/api/track/click/[id]/route.js
import { connectDB } from '@/lib/db';
import { TrackedEmail } from '@/lib/models/TrackedEmail';
import { ClickEvent } from '@/lib/models/ClickEvent';

function isSafeDestination(to) {
  return typeof to === 'string' && /^https?:\/\//i.test(to);
}

export async function GET(req, context) {
  const { id } = await context.params;
  const { searchParams } = new URL(req.url);
  const to = searchParams.get('to');

  if (!isSafeDestination(to)) {
    return new Response('Missing or invalid destination', { status: 400 });
  }

  try {
    await connectDB();
    const email = await TrackedEmail.findById(id);
    if (email) {
      await ClickEvent.create({
        trackedEmailId: email._id,
        ip: req.headers.get('x-forwarded-for') ?? '',
        userAgent: req.headers.get('user-agent') ?? '',
        destination: to,
      });
    }
  } catch (err) {
    console.error('track/click failed:', err.message);
  }

  return Response.redirect(to, 302);
}
