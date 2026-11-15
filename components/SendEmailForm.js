'use client';

import { useState } from 'react';
import { buildTrackedEmailHtml } from '@/lib/emailTemplate';

const ASTROVEDA_DEFAULTS = {
  theme: 'astroveda',
  to: '',
  senderName: 'AstroVeda Community',
  subject: 'AstroVeda Vedic Guidance & Consultation Pass for Reena',
  label: 'Reena - AstroVeda VIP Invitation',
  recipientName: 'Reena',
  headerBadge: '✦ AstroVeda Vedic Community ✦',
  headerTitle: 'Vedic Astrology Consultation 🌟',
  introText: 'Warm greetings from AstroVeda. We are delighted to share that your complimentary consultation pass for personalized Vedic astrology, Kundli matching, and remedial guidance has been unlocked.',
  awardTitle: '👑 AstroVeda Welcome Consultation Pass',
  awardSubtitle: '14 Days of Complimentary Astrological Consultation & Gun Milan',
  benefit1Title: 'Past, Present & Future Insights',
  benefit1Desc: 'Explore deep revelations about your life events, current emotional state, and upcoming golden phases.',
  benefit2Title: 'Dual Kundli Compatibility (2 DOBs)',
  benefit2Desc: 'Add two Dates of Birth to unlock detailed Gun Milan, relationship harmony, and partner compatibility.',
  benefit3Title: 'Divine Remedial Guidance (Upay)',
  benefit3Desc: 'Receive authentic Vedic remedies and spiritual advice blessed with divine peace and protection.',
  buttonText: 'Claim Your Consultation Pass on Telegram ➔',
  buttonUrl: 'https://t.me/AstroVedaOfficial_bot?start=vip10000',
  footerTitle: 'AstroVeda Community • Vedic Astrology & Spiritual Guidance',
  footerSubtitle: 'Trusted by 9,578+ Seekers across India',
  useDirectLink: true,
  publicTrackerUrl: '',
  // Classic fallbacks
  eyebrow: '',
  message: '',
};

const CLASSIC_DEFAULTS = {
  theme: 'classic',
  to: '',
  senderName: '',
  subject: 'A small thing, for you',
  label: '',
  eyebrow: 'a small thing, for you',
  message: "I made something. It's small, and it's yours.",
  buttonText: 'Open It →',
  buttonUrl: '',
  useDirectLink: false,
  publicTrackerUrl: '',
  recipientName: '',
  headerBadge: '',
  headerTitle: '',
  introText: '',
  awardTitle: '',
  awardSubtitle: '',
  benefit1Title: '',
  benefit1Desc: '',
  benefit2Title: '',
  benefit2Desc: '',
  benefit3Title: '',
  benefit3Desc: '',
  footerTitle: '',
  footerSubtitle: '',
};

export default function SendEmailForm() {
  const [form, setForm] = useState(ASTROVEDA_DEFAULTS);
  const [status, setStatus] = useState(null);
  const [sending, setSending] = useState(false);
  const [previewHtml, setPreviewHtml] = useState(null);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function handleThemeChange(e) {
    const nextTheme = e.target.value;
    if (nextTheme === 'astroveda') {
      setForm((f) => ({
        ...ASTROVEDA_DEFAULTS,
        to: f.to,
        label: f.label || ASTROVEDA_DEFAULTS.label,
        publicTrackerUrl: f.publicTrackerUrl,
      }));
    } else {
      setForm((f) => ({
        ...CLASSIC_DEFAULTS,
        to: f.to,
        label: f.label || CLASSIC_DEFAULTS.label,
        publicTrackerUrl: f.publicTrackerUrl,
      }));
    }
    setPreviewHtml(null);
  }

  function handlePreview(e) {
    e.preventDefault();
    setPreviewHtml(
      buildTrackedEmailHtml({
        ...form,
        buttonUrl: form.buttonUrl || '#',
        pixelUrl: '',
      })
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    setStatus(null);
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || !json.sent) {
        setStatus({ ok: false, text: json.error || 'Could not send email.' });
      } else {
        const trackingMsg = json.trackingEnabled
          ? 'Live pixel tracking enabled.'
          : 'Zero-Spam mode active (localhost stripped out for 100% Primary Inbox deliverability).';
        setStatus({
          ok: true,
          text: `✅ Email dispatched successfully! ${trackingMsg}`,
        });
      }
    } catch (err) {
      setStatus({ ok: false, text: 'Could not send email. Try again.' });
    } finally {
      setSending(false);
    }
  }

  const isAstro = form.theme === 'astroveda';

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: '1.25rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        marginBottom: '1.5rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ✉️ Compose & Send Tracked Email
        </h3>
        <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', background: '#e0e7ff', color: '#4338ca', borderRadius: 12, fontWeight: 600 }}>
          {isAstro ? 'AstroVeda VIP Theme' : 'Classic Theme'}
        </span>
      </div>

      {/* Spam Prevention Banner */}
      <div
        style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: 8,
          padding: '0.65rem 0.85rem',
          marginBottom: '1rem',
          fontSize: '0.8rem',
          color: '#166534',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <span style={{ fontSize: '1rem' }}>🛡️</span>
        <span>
          <strong>Anti-Spam Shield Enabled:</strong> All <code>localhost</code> URLs and promotional scam-triggers are automatically stripped from emails to ensure delivery directly into <strong>Primary Inbox</strong>.
        </span>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {/* Row 1: Theme & Sender Name */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>
              Email Template / Theme:
            </label>
            <select
              value={form.theme}
              onChange={handleThemeChange}
              style={{
                width: '100%',
                padding: '0.6rem',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#1e293b',
              }}
            >
              <option value="astroveda">🔮 AstroVeda VIP Cosmic Theme (Vedic Pass)</option>
              <option value="classic">📜 Classic Minimalist Theme</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>
              Sender Display Name:
            </label>
            <input
              type="text"
              placeholder="e.g. AstroVeda Community"
              value={form.senderName}
              onChange={update('senderName')}
              style={{
                width: '100%',
                padding: '0.6rem',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Row 2: To & Subject */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>
              Recipient Email (To): <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="email"
              placeholder="recipient@example.com"
              value={form.to}
              onChange={update('to')}
              required
              style={{
                width: '100%',
                padding: '0.6rem',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>
              Subject Line:
            </label>
            <input
              type="text"
              value={form.subject}
              onChange={update('subject')}
              placeholder="Subject"
              style={{
                width: '100%',
                padding: '0.6rem',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Internal Label */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>
            Dashboard Tracker Label (For your reference):
          </label>
          <input
            type="text"
            placeholder="e.g. Reena - AstroVeda Invitation"
            value={form.label}
            onChange={update('label')}
            style={{
              width: '100%',
              padding: '0.6rem',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              fontSize: '0.875rem',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* AstroVeda Theme Specific Customizer */}
        {isAstro ? (
          <div
            style={{
              background: '#f8f7ff',
              border: '1px solid #ddd6fe',
              borderRadius: 10,
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#6d28d9', fontWeight: 700, fontSize: '0.9rem' }}>
              <span>🔮</span> AstroVeda VIP Content Customization
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.6rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#5b21b6' }}>Recipient Name:</label>
                <input
                  type="text"
                  value={form.recipientName}
                  onChange={update('recipientName')}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#5b21b6' }}>Header Badge:</label>
                <input
                  type="text"
                  value={form.headerBadge}
                  onChange={update('headerBadge')}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#5b21b6' }}>Header Title:</label>
                <input
                  type="text"
                  value={form.headerTitle}
                  onChange={update('headerTitle')}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#5b21b6' }}>Greeting & Introduction Story:</label>
              <textarea
                rows={2}
                value={form.introText}
                onChange={update('introText')}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.6rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#5b21b6' }}>Award Title:</label>
                <input
                  type="text"
                  value={form.awardTitle}
                  onChange={update('awardTitle')}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#5b21b6' }}>Award Subtitle:</label>
                <input
                  type="text"
                  value={form.awardSubtitle}
                  onChange={update('awardSubtitle')}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              background: '#fdfaf6',
              border: '1px solid #e6d8c8',
              borderRadius: 10,
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
            }}
          >
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6d1f34' }}>Eyebrow Line:</label>
              <input
                type="text"
                value={form.eyebrow}
                onChange={update('eyebrow')}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6d1f34' }}>Message:</label>
              <textarea
                rows={2}
                value={form.message}
                onChange={update('message')}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        )}

        {/* CTA Button and Spam Protection Settings */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.6rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>Button Text:</label>
              <input
                type="text"
                value={form.buttonText}
                onChange={update('buttonText')}
                style={{ width: '100%', padding: '0.55rem', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>Button Destination URL:</label>
              <input
                type="url"
                value={form.buttonUrl}
                onChange={update('buttonUrl')}
                required
                style={{ width: '100%', padding: '0.55rem', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Optional Public Tunnel URL for remote tracking */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>
              Public Tracker URL (Optional — e.g. from ngrok <code>https://xyz.ngrok-free.app</code> or Vercel):
            </label>
            <input
              type="url"
              placeholder="Leave blank on localhost for zero-spam mode"
              value={form.publicTrackerUrl}
              onChange={update('publicTrackerUrl')}
              style={{ width: '100%', padding: '0.45rem', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.25rem' }}>
          <button
            type="button"
            onClick={handlePreview}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: 8,
              border: '1px solid #6366f1',
              background: '#eef2ff',
              color: '#4338ca',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            👁️ Live Preview
          </button>
          <button
            type="submit"
            disabled={sending}
            style={{
              padding: '0.65rem 1.75rem',
              borderRadius: 8,
              border: 'none',
              background: sending ? '#94a3b8' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: sending ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
            }}
          >
            {sending ? 'Sending…' : '🚀 Send Tracked Email'}
          </button>
        </div>
      </form>

      {status && (
        <div
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            borderRadius: 8,
            background: status.ok ? '#ecfdf5' : '#fef2f2',
            border: `1px solid ${status.ok ? '#a7f3d0' : '#fecaca'}`,
            color: status.ok ? '#065f46' : '#991b1b',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          {status.text}
        </div>
      )}

      {previewHtml && (
        <div style={{ marginTop: '1.25rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
              Live Template Preview:
            </span>
            <button
              type="button"
              onClick={() => setPreviewHtml(null)}
              style={{ fontSize: '0.75rem', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Close preview
            </button>
          </div>
          <iframe
            title="Email preview"
            srcDoc={previewHtml}
            style={{ width: '100%', height: '560px', border: '1px solid #cbd5e1', borderRadius: 8, background: '#0d0a1a' }}
          />
        </div>
      )}
    </div>
  );
}
