// lib/emailTemplate.js
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildTrackedEmailHtml({ eyebrow, message, buttonText, buttonUrl, pixelUrl }) {
  const safeEyebrow = escapeHtml(eyebrow);
  const safeMessage = escapeHtml(message);
  const safeButtonText = escapeHtml(buttonText);

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
      <img src="${pixelUrl}" width="1" height="1" style="display:none" alt="" />
    </td>
  </tr>
</table>`;
}
