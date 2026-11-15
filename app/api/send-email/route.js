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
    publicTrackerUrl,
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

  // Determine host and public origin
  const host = req.headers.get('host') || 'localhost:3000';
  const isLocalHost = host.includes('localhost') || host.includes('127.0.0.1');

  // Candidate base URL for tracking
  const configuredPublic = (publicTrackerUrl || process.env.PUBLIC_TRACKER_URL || '').trim().replace(/\/+$/, '');
  const effectiveOrigin = configuredPublic || (!isLocalHost ? `${host.startsWith('localhost') ? 'http' : 'https'}://${host}` : '');

  // CRITICAL SPAM FIX:
  // If running on localhost and no public HTTPS URL is configured:
  // DO NOT inject 'http://localhost' into the email!
  // Gmail's image proxy and anti-phishing filters instantly flag any email with 'http://localhost' as Spam.
  const pixelUrl = effectiveOrigin ? `${effectiveOrigin}/api/track/open/${id}` : '';
  const clickUrl = (effectiveOrigin && !useDirectLink)
    ? `${effectiveOrigin}/api/track/click/${id}?to=${encodeURIComponent(buttonUrl)}`
    : buttonUrl;

  const html = buildTrackedEmailHtml({
    theme,
    eyebrow: eyebrow || 'a small thing, for you',
    message: message || "I made something. It's small, and it's yours.",
    recipientName: recipientName || 'Seeker',
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

  // Plain-text alternative (multipart/alternative) - essential for spam filter clearance
  const textContent = theme === 'astroveda'
    ? `Dear ${recipientName || 'Seeker'},\n\n${introText || 'Warm greetings from AstroVeda.'}\n\n${awardTitle || 'Vedic Astrology Consultation Pass'}\n${awardSubtitle || ''}\n\nClaim Your Pass on Telegram: ${buttonUrl}\n\nWarm regards,\n${senderName || 'AstroVeda Community'}`
    : `${eyebrow || ''}\n\n${message || ''}\n\n${buttonUrl}`;

  const defaultSubject = theme === 'astroveda'
    ? 'AstroVeda Vedic Guidance & Consultation Pass for Reena'
    : 'A small thing, for you';

  try {
    await sendMail({
      to,
      subject: subject || defaultSubject,
      html,
      text: textContent,
      senderName,
    });
  } catch (err) {
    return Response.json({ id, sent: false, error: 'Failed to send email' }, { status: 502 });
  }

  return Response.json({
    id,
    sent: true,
    trackingEnabled: Boolean(pixelUrl),
    effectiveOrigin: effectiveOrigin || 'localhost (tracking pixel omitted to guarantee inbox delivery)',
  });
}
