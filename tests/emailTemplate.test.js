import { describe, it, expect } from 'vitest';

describe('buildTrackedEmailHtml', () => {
  it('embeds the message, button text/url, and pixel url in the HTML', async () => {
    const { buildTrackedEmailHtml } = await import('../lib/emailTemplate.js');
    const html = buildTrackedEmailHtml({
      eyebrow: 'a small thing, for you',
      message: "I made something. It's small, and it's yours.",
      buttonText: 'Open It →',
      buttonUrl: 'https://example.com/click/123?to=https://x.com',
      pixelUrl: 'https://example.com/open/123',
    });

    expect(html).toContain('a small thing, for you');
    expect(html).toContain("I made something. It&#39;s small, and it&#39;s yours.");
    expect(html).toContain('Open It →');
    expect(html).toContain('https://example.com/click/123?to=https://x.com');
    expect(html).toContain('https://example.com/open/123');
    expect(html).toMatch(/<img[^>]+src="https:\/\/example\.com\/open\/123"/);
  });

  it('HTML-escapes user-supplied text to prevent markup injection', async () => {
    const { buildTrackedEmailHtml } = await import('../lib/emailTemplate.js');
    const html = buildTrackedEmailHtml({
      eyebrow: '<script>alert(1)</script>',
      message: 'hello & <b>world</b>',
      buttonText: 'Click',
      buttonUrl: 'https://example.com/click/123',
      pixelUrl: 'https://example.com/open/123',
    });

    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('hello &amp; &lt;b&gt;world&lt;/b&gt;');
  });
});
