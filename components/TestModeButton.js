'use client';

import { useState } from 'react';

export default function TestModeButton() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  async function startTestMode() {
    setLoading(true);
    try {
      const res = await fetch('/api/test-mode', { method: 'POST' });
      const { expiresAt } = await res.json();
      const until = new Date(expiresAt).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });
      setStatus(`Test mode ON until ${until} — any open in this window will be tagged as you.`);
    } catch (err) {
      setStatus('Could not start test mode. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <button onClick={startTestMode} disabled={loading}>
        {loading ? 'Starting…' : "🧪 I'm testing now (next 3 min)"}
      </button>
      {status && <p style={{ fontSize: '0.85rem', color: '#555', marginTop: '0.5rem' }}>{status}</p>}
    </div>
  );
}
