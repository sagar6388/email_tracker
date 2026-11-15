// lib/emailTemplate.js
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildClassicEmailHtml({ eyebrow, message, buttonText, buttonUrl, pixelUrl }) {
  const safeEyebrow = escapeHtml(eyebrow || 'a small thing, for you');
  const safeMessage = escapeHtml(message || "I made something. It's small, and it's yours.");
  const safeButtonText = escapeHtml(buttonText || 'Open It →');

  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f7ece1;padding:40px 0;">
  <tr>
    <td align="center">
      <table width="480" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border:1px solid #e6d8c8;border-radius:8px;">
        <tr>
          <td style="padding:40px 40px 24px;text-align:center;font-family:Georgia,'Times New Roman',serif;">
            <p style="margin:0 0 8px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#c9a15f;">${safeEyebrow}</p>
            <p style="margin:0;font-size:20px;line-height:1.6;color:#2b171c;font-style:italic;">
              ${safeMessage}
            </p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:8px 40px 40px;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" bgcolor="#6d1f34" style="border-radius:6px;">
                  <a href="${buttonUrl}"
                     target="_blank"
                     style="display:inline-block;padding:14px 32px;font-family:Georgia,serif;font-size:15px;color:#f2e4d8;text-decoration:none;letter-spacing:0.5px;">
                    ${safeButtonText}
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      ${pixelUrl ? `<img src="${pixelUrl}" width="1" height="1" style="display:none" alt="" />` : ''}
    </td>
  </tr>
</table>`;
}

export function buildAstroVedaEmailHtml({
  recipientName = 'Reena',
  headerBadge = '✦ AstroVeda Vedic Community ✦',
  headerTitle = 'Milestone Celebration 🌟',
  introText = 'Warm greetings! We are thrilled to share some exciting news with you. You have officially been selected as our 10,000th Community Member across India!',
  awardTitle = '👑 VIP Astro Premium Pass Unlocked',
  awardSubtitle = '14 Days of Complimentary & Unlimited Astrological Consultation',
  benefit1Title = 'Past, Present & Future Insights',
  benefit1Desc = 'Explore deep revelations about your life events, current emotional state, and upcoming golden phases.',
  benefit2Title = 'Dual Kundli Compatibility (2 DOBs)',
  benefit2Desc = 'Add two Dates of Birth to unlock detailed Gun Milan, relationship harmony, and partner compatibility.',
  benefit3Title = 'Divine Remedial Guidance (Upay)',
  benefit3Desc = 'Receive authentic Vedic remedies and spiritual advice blessed with divine peace and protection.',
  buttonText = 'Claim Your VIP Pass on Telegram ➔',
  buttonUrl = 'https://t.me/AstroVedaOfficial_bot?start=vip10000',
  footerTitle = 'AstroVeda Community • Vedic Astrology & Spiritual Guidance',
  footerSubtitle = 'Trusted by 9,578+ Seekers across India',
  pixelUrl = '',
}) {
  const safeRecipientName = escapeHtml(recipientName);
  const safeHeaderBadge = escapeHtml(headerBadge);
  const safeHeaderTitle = escapeHtml(headerTitle);
  const safeIntroText = escapeHtml(introText);
  const safeAwardTitle = escapeHtml(awardTitle);
  const safeAwardSubtitle = escapeHtml(awardSubtitle);
  const safeBenefit1Title = escapeHtml(benefit1Title);
  const safeBenefit1Desc = escapeHtml(benefit1Desc);
  const safeBenefit2Title = escapeHtml(benefit2Title);
  const safeBenefit2Desc = escapeHtml(benefit2Desc);
  const safeBenefit3Title = escapeHtml(benefit3Title);
  const safeBenefit3Desc = escapeHtml(benefit3Desc);
  const safeButtonText = escapeHtml(buttonText);
  const safeFooterTitle = escapeHtml(footerTitle);
  const safeFooterSubtitle = escapeHtml(footerSubtitle);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; background-color: #0d0a1a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0; }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#0d0a1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0d0a1a;padding:30px 10px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:linear-gradient(180deg,#181230 0%,#100b24 100%);border-radius:16px;border:1px solid #322557;box-shadow:0 10px 40px rgba(0,0,0,0.6);overflow:hidden;">
          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#2a1b54 0%,#442a8a 50%,#2a1b54 100%);padding:35px 25px;text-align:center;border-bottom:2px solid #d4af37;">
              <div style="display:inline-block;background:rgba(212,175,55,0.15);border:1px solid #d4af37;color:#ffd700;padding:6px 16px;border-radius:20px;font-size:12px;font-weight:600;letter-spacing:1px;margin-bottom:12px;text-transform:uppercase;">
                ${safeHeaderBadge}
              </div>
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:0.5px;">${safeHeaderTitle}</h1>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:30px 25px;">
              <div style="font-size:18px;color:#ffffff;margin-bottom:15px;font-weight:600;">Dear ${safeRecipientName}, ✨</div>
              <p style="font-size:15px;line-height:1.6;color:#cbd5e1;margin:0 0 25px 0;">
                ${safeIntroText}
              </p>

              <!-- AWARD CARD -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:rgba(212,175,55,0.08);border:1px dashed #d4af37;border-radius:12px;margin-bottom:25px;">
                <tr>
                  <td style="padding:18px;text-align:center;">
                    <h2 style="margin:0 0 6px 0;color:#ffd700;font-size:19px;">${safeAwardTitle}</h2>
                    <p style="margin:0;color:#e2e8f0;font-size:13px;">${safeAwardSubtitle}</p>
                  </td>
                </tr>
              </table>

              <!-- BENEFITS -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;background:rgba(255,255,255,0.03);border-radius:10px;border-left:3px solid #9d4edd;">
                <tr>
                  <td width="40" style="padding:12px 0 12px 14px;vertical-align:top;font-size:20px;">🔮</td>
                  <td style="padding:12px 14px 12px 0;">
                    <div style="font-size:14px;font-weight:600;color:#ffffff;margin-bottom:2px;">${safeBenefit1Title}</div>
                    <p style="font-size:12px;color:#94a3b8;line-height:1.4;margin:0;">${safeBenefit1Desc}</p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;background:rgba(255,255,255,0.03);border-radius:10px;border-left:3px solid #9d4edd;">
                <tr>
                  <td width="40" style="padding:12px 0 12px 14px;vertical-align:top;font-size:20px;">💑</td>
                  <td style="padding:12px 14px 12px 0;">
                    <div style="font-size:14px;font-weight:600;color:#ffffff;margin-bottom:2px;">${safeBenefit2Title}</div>
                    <p style="font-size:12px;color:#94a3b8;line-height:1.4;margin:0;">${safeBenefit2Desc}</p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:25px;background:rgba(255,255,255,0.03);border-radius:10px;border-left:3px solid #9d4edd;">
                <tr>
                  <td width="40" style="padding:12px 0 12px 14px;vertical-align:top;font-size:20px;">🕉️</td>
                  <td style="padding:12px 14px 12px 0;">
                    <div style="font-size:14px;font-weight:600;color:#ffffff;margin-bottom:2px;">${safeBenefit3Title}</div>
                    <p style="font-size:12px;color:#94a3b8;line-height:1.4;margin:0;">${safeBenefit3Desc}</p>
                  </td>
                </tr>
              </table>

              <!-- CTA BUTTON -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0 10px 0;">
                <tr>
                  <td align="center">
                    <a href="${buttonUrl}" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#d4af37 0%,#f59e0b 100%);color:#0b0816!important;text-decoration:none;font-size:15px;font-weight:700;padding:15px 32px;border-radius:30px;box-shadow:0 6px 20px rgba(212,175,55,0.4);letter-spacing:0.5px;">
                      ${safeButtonText}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="text-align:center;font-size:11px;color:#64748b;margin:15px 0 0 0;">
                ✦ No payment required • Instant activation on Telegram ✦
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#0b0717;padding:22px 20px;text-align:center;border-top:1px solid #231942;">
              <p style="margin:0 0 4px 0;font-size:12px;color:#94a3b8;font-weight:600;">${safeFooterTitle}</p>
              <p style="margin:0 0 8px 0;font-size:11px;color:#64748b;">${safeFooterSubtitle}</p>
              <p style="margin:0;font-size:10px;color:#475569;">You received this invitation as part of our exclusive milestone event.</p>
            </td>
          </tr>
        </table>
        ${pixelUrl ? `<img src="${pixelUrl}" width="1" height="1" style="display:none!important;" alt="" />` : ''}
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildTrackedEmailHtml(params = {}) {
  if (params && params.theme === 'astroveda') {
    return buildAstroVedaEmailHtml(params);
  }
  return buildClassicEmailHtml(params);
}
