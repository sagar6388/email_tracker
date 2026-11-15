'use client';

import { useState } from 'react';

export default function AdminLoginForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!password) return;
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid admin password.');
      } else {
        window.location.reload();
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0d0a1a 0%, #17112c 50%, #0d0a1a 100%)',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'rgba(25, 18, 48, 0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: 16,
          padding: '2.5rem 2rem',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          textAlign: 'center',
          color: '#e2e8f0',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            margin: '0 auto 1.25rem',
            background: 'linear-gradient(135deg, #d4af37 0%, #9d4edd 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            boxShadow: '0 8px 24px rgba(212, 175, 55, 0.35)',
          }}
        >
          🔐
        </div>

        <h2 style={{ margin: '0 0 0.4rem', color: '#ffffff', fontSize: '1.5rem', fontWeight: 700 }}>
          Admin Authentication
        </h2>
        <p style={{ margin: '0 0 1.75rem', fontSize: '0.875rem', color: '#94a3b8' }}>
          Enter your admin password to access the Email Tracker & Analytics Dashboard
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
              Master Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
                style={{
                  width: '100%',
                  padding: '0.75rem 2.8rem 0.75rem 0.9rem',
                  borderRadius: 10,
                  border: '1px solid #3b2d66',
                  background: 'rgba(13, 10, 26, 0.7)',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  padding: 4,
                }}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && (
            <div
              style={{
                padding: '0.6rem 0.8rem',
                borderRadius: 8,
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fca5a5',
                fontSize: '0.85rem',
                textAlign: 'center',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.5rem',
              padding: '0.8rem',
              borderRadius: 10,
              border: 'none',
              background: loading ? '#6b7280' : 'linear-gradient(135deg, #d4af37 0%, #b45309 100%)',
              color: '#0d0a1a',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px rgba(212, 175, 55, 0.3)',
              transition: 'opacity 0.2s',
            }}
          >
            {loading ? 'Verifying…' : 'Unlock Dashboard ➔'}
          </button>
        </form>

        <p style={{ marginTop: '1.75rem', marginBottom: 0, fontSize: '0.75rem', color: '#64748b' }}>
          Configured in <code>.env.local</code> as <code>ADMIN_PASSWORD</code>
        </p>
      </div>
    </div>
  );
}
