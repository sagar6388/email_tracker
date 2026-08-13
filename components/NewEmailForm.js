'use client';

import { useState } from 'react';

export default function NewEmailForm({ origin }) {
  const [label, setLabel] = useState('');
  const [snippet, setSnippet] = useState(null);
  const [error, setError] = useState(null);

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
        url,
        html: `<img src="${url}" width="1" height="1" style="display:none" alt="" />`,
      });
      setLabel('');
    } catch (err) {
      setError('Could not create tracked email. Try again.');
    }
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
        </div>
      )}
    </div>
  );
}
