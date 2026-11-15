// app/api/send-email/route.js
import { connectDB } from '@/lib/db';
import { TrackedEmail } from '@/lib/models/TrackedEmail';
import { buildTrackedEmailHtml } from '@/lib/emailTemplate';
import { sendMail } from '@/lib/mailer';

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const {
    to,
    subject,
    label,
    theme,
    senderName,
    useDirectLink,
    // Classic fields
    eyebrow,
    message,
    // AstroVeda fields
    recipientName,
    headerBadge,
    headerTitle,
    introText,
    awardTitle,
    awardSubtitle,
    benefit1Title,
    benefit1Desc,
    benefit2Title,
    benefit2Desc,
    benefit3Title,
    benefit3Desc,
    footerTitle,
    footerSubtitle,
    // CTA Button
    buttonText,
    buttonUrl,
  } = body;

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
  // If useDirectLink is enabled (default on localhost to avoid spam filters), bypass localhost redirect
  const clickUrl = useDirectLink
    ? buttonUrl
    : `${origin}/api/track/click/${id}?to=${encodeURIComponent(buttonUrl)}`;

  const html = buildTrackedEmailHtml({
    theme,
    eyebrow: eyebrow || 'a small thing, for you',
    message: message || "I made something. It's small, and it's yours.",
    recipientName,
    headerBadge,
    headerTitle,
    introText,
    awardTitle,
    awardSubtitle,
    benefit1Title,
    benefit1Desc,
    benefit2Title,
    benefit2Desc,
    benefit3Title,
    benefit3Desc,
    footerTitle,
    footerSubtitle,
    buttonText: buttonText || (theme === 'astroveda' ? 'Claim Your Consultation Pass on Telegram ➔' : 'Open It →'),
    buttonUrl: clickUrl,
    pixelUrl,
  });

  const defaultSubject = theme === 'astroveda'
    ? 'AstroVeda Vedic Guidance & Consultation Pass for Reena'
    : 'A small thing, for you';

  try {
    await sendMail({
      to,
      subject: subject || defaultSubject,
      html,
      senderName,
    });
  } catch (err) {
    return Response.json({ id, sent: false, error: 'Failed to send email' }, { status: 502 });
  }

  return Response.json({ id, sent: true });
}
