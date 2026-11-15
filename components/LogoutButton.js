'use client';

import { useState } from 'react';

export default function LogoutButton() {
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      window.location.reload();
    } catch (err) {
      window.location.reload();
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loggingOut}
      title="Lock and logout"
      style={{
        padding: '0.45rem 0.85rem',
        borderRadius: 8,
        border: '1px solid rgba(255, 255, 255, 0.15)',
        background: 'rgba(255, 255, 255, 0.05)',
        color: '#cbd5e1',
        fontSize: '0.8rem',
        fontWeight: 600,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        transition: 'all 0.2s',
      }}
    >
      🔒 {loggingOut ? 'Locking…' : 'Logout'}
    </button>
  );
}
