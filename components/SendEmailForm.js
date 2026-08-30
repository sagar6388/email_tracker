'use client';

import { useState } from 'react';
import { buildTrackedEmailHtml } from '@/lib/emailTemplate';

const initialState = {
  to: '',
  subject: 'A small thing, for you',
  label: '',
  eyebrow: 'a small thing, for you',
  message: "I made something. It's small, and it's yours.",
  buttonText: 'Open It →',
  buttonUrl: '',
};

export default function SendEmailForm() {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState(null);
  const [sending, setSending] = useState(false);
  const [previewHtml, setPreviewHtml] = useState(null);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function handlePreview(e) {
    e.preventDefault();
    setPreviewHtml(
      buildTrackedEmailHtml({
        eyebrow: form.eyebrow || 'a small thing, for you',
        message: form.message || "I made something. It's small, and it's yours.",
        buttonText: form.buttonText || 'Open It →',
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
        setStatus({ ok: true, text: 'Sent! Check the dashboard below for opens/clicks.' });
        setForm(initialState);
      }
    } catch (err) {
      setStatus({ ok: false, text: 'Could not send email. Try again.' });
    } finally {
      setSending(false);
    }
  }

  return (
    <details style={{ marginBottom: '2rem', border: '1px solid #eee', borderRadius: 6, padding: '0.75rem' }}>
      <summary style={{ cursor: 'pointer', fontWeight: 700 }}>✉️ Send a tracked email (via your Gmail)</summary>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
        <input type="email" placeholder="To — her@example.com" value={form.to} onChange={update('to')} required style={{ padding: '0.5rem' }} />
        <input type="text" placeholder="Subject" value={form.subject} onChange={update('subject')} style={{ padding: '0.5rem' }} />
        <input type="text" placeholder="Internal label (optional) — e.g. Roses" value={form.label} onChange={update('label')} style={{ padding: '0.5rem' }} />
        <input type="text" placeholder="Eyebrow line" value={form.eyebrow} onChange={update('eyebrow')} style={{ padding: '0.5rem' }} />
        <textarea placeholder="Message" value={form.message} onChange={update('message')} rows={2} style={{ padding: '0.5rem' }} />
        <input type="text" placeholder="Button text" value={form.buttonText} onChange={update('buttonText')} style={{ padding: '0.5rem' }} />
        <input type="url" placeholder="Button destination URL" value={form.buttonUrl} onChange={update('buttonUrl')} required style={{ padding: '0.5rem' }} />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" onClick={handlePreview}>Preview</button>
          <button type="submit" disabled={sending}>{sending ? 'Sending…' : 'Send'}</button>
        </div>
      </form>
      {status && <p style={{ color: status.ok ? '#2a8' : 'crimson', marginTop: '0.5rem' }}>{status.text}</p>}
      {previewHtml && (
        <div style={{ marginTop: '1rem' }}>
          <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.4rem' }}>Preview (pixel/tracking won't fire from this):</p>
          <iframe
            title="Email preview"
            srcDoc={previewHtml}
            style={{ width: '100%', height: '360px', border: '1px solid #eee', borderRadius: 6, background: '#fff' }}
          />
        </div>
      )}
    </details>
  );
}
