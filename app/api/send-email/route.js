// app/api/send-email/route.js
import { connectDB } from '@/lib/db';
import { TrackedEmail } from '@/lib/models/TrackedEmail';
import { buildTrackedEmailHtml } from '@/lib/emailTemplate';
import { sendMail } from '@/lib/mailer';

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const { to, subject, label, eyebrow, message, buttonText, buttonUrl } = body;

  if (!to || !buttonUrl) {
    return Response.json({ error: 'to and buttonUrl are required' }, { status: 400 });
  }

  await connectDB();

  const email = await TrackedEmail.create({
    label: typeof label === 'string' && label.trim() ? label.trim() : undefined,
  });
  const id = email._id.toString();

  const host = req.headers.get('host');
  const protocol = host?.startsWith('localhost') ? 'http' : 'https';
  const origin = `${protocol}://${host}`;

  const pixelUrl = `${origin}/api/track/open/${id}`;
  const clickUrl = `${origin}/api/track/click/${id}?to=${encodeURIComponent(buttonUrl)}`;

  const html = buildTrackedEmailHtml({
    eyebrow: eyebrow || 'a small thing, for you',
    message: message || "I made something. It's small, and it's yours.",
    buttonText: buttonText || 'Open It →',
    buttonUrl: clickUrl,
    pixelUrl,
  });

  try {
    await sendMail({ to, subject: subject || 'A small thing, for you', html });
  } catch (err) {
    return Response.json({ id, sent: false, error: 'Failed to send email' }, { status: 502 });
  }

  return Response.json({ id, sent: true });
}
