'use client';

import { useState } from 'react';

export default function NewEmailForm({ origin }) {
  const [label, setLabel] = useState('');
  const [snippet, setSnippet] = useState(null);
  const [error, setError] = useState(null);
  const [destination, setDestination] = useState('');
  const [linkSnippet, setLinkSnippet] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label }),
      });
      if (!res.ok) throw new Error('Request failed');
      const { id } = await res.json();
      const url = `${origin}/api/track/open/${id}`;
      setSnippet({
        id,
        url,
        html: `<img src="${url}" width="1" height="1" style="display:none" alt="" />`,
      });
      setLabel('');
      setLinkSnippet(null);
      setDestination('');
    } catch (err) {
      setError('Could not create tracked email. Try again.');
    }
  }

  function handleGenerateLink(e) {
    e.preventDefault();
    if (!destination.trim()) return;
    const url = `${origin}/api/track/click/${snippet.id}?to=${encodeURIComponent(destination.trim())}`;
    setLinkSnippet({
      url,
      html: `<a href="${url}" style="background:#0087e0;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">Click here</a>`,
    });
  }

  return (
    <div style={{ marginBottom: '2rem' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          placeholder="Label (optional) — e.g. Follow-up to Priya"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          style={{ flex: 1, padding: '0.5rem' }}
        />
        <button type="submit">+ New Tracked Email</button>
      </form>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {snippet && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#f4f4f4' }}>
          <p>Paste this into your email (Gmail: Insert Image → By URL):</p>
          <code style={{ display: 'block', wordBreak: 'break-all' }}>{snippet.url}</code>
          <textarea readOnly value={snippet.html} style={{ width: '100%', marginTop: '0.5rem' }} rows={2} />

          <p style={{ marginTop: '1rem' }}>Optional: add a tracked button/link (gives real recipient IP, not Gmail-proxied):</p>
          <form onSubmit={handleGenerateLink} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="url"
              placeholder="Destination URL — e.g. https://your-portfolio.com"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              style={{ flex: 1, padding: '0.5rem' }}
            />
            <button type="submit">Generate tracked link</button>
          </form>
          {linkSnippet && (
            <div style={{ marginTop: '0.5rem' }}>
              <code style={{ display: 'block', wordBreak: 'break-all' }}>{linkSnippet.url}</code>
              <textarea readOnly value={linkSnippet.html} style={{ width: '100%', marginTop: '0.5rem' }} rows={2} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
