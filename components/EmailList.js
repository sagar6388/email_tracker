'use client';

import { useState } from 'react';
import DeleteEmailButton from '@/components/DeleteEmailButton';

function formatIST(date) {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const CLASSIFICATION_LABEL = {
  'self-test': { text: '✅ You (test)', color: '#059669', bg: '#ecfdf5' },
  automated: { text: '⚠️ Likely bot', color: '#d97706', bg: '#fffbeb' },
  recipient: { text: '👤 Recipient', color: '#2563eb', bg: '#eff6ff' },
};

export default function EmailList({ emails = [] }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, opened, unread, clicked

  const filtered = emails.filter((email) => {
    const labelMatch = (email.label || 'no label').toLowerCase().includes(search.toLowerCase());
    if (!labelMatch) return false;

    if (filter === 'opened') return email.openCount > 0;
    if (filter === 'unread') return email.openCount === 0;
    if (filter === 'clicked') return email.clickCount > 0;
    return true;
  });

  return (
    <div style={{ marginTop: '2rem' }}>
      {/* Controls Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <input
            type="text"
            placeholder="🔍 Search emails by label..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.85rem',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              fontSize: '0.875rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {[
            { id: 'all', label: `All (${emails.length})` },
            { id: 'opened', label: 'Opened' },
            { id: 'unread', label: 'Unopened' },
            { id: 'clicked', label: 'Clicked' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              style={{
                padding: '0.45rem 0.75rem',
                borderRadius: 6,
                border: filter === tab.id ? '1px solid #2563eb' : '1px solid #e2e8f0',
                background: filter === tab.id ? '#eff6ff' : '#ffffff',
                color: filter === tab.id ? '#1d4ed8' : '#64748b',
                fontSize: '0.8rem',
                fontWeight: filter === tab.id ? 700 : 500,
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '2.5rem 1rem',
            background: '#ffffff',
            borderRadius: 12,
            border: '1px dashed #cbd5e1',
            color: '#64748b',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
          <p style={{ margin: 0, fontWeight: 600 }}>No tracked emails match your filter.</p>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
            Compose a new tracked email above to get started.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map((email) => {
            const isOpened = email.openCount > 0;
            const isClicked = email.clickCount > 0;

            return (
              <details
                key={email.id}
                style={{
                  background: '#ffffff',
                  border: isOpened ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                  borderRadius: 10,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  overflow: 'hidden',
                }}
              >
                <summary
                  style={{
                    padding: '0.9rem 1.1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '1.25rem' }}>{isClicked ? '🎯' : isOpened ? '📬' : '✉️'}</span>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          color: '#1e293b',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {email.label || '(Untitled Email)'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Created {formatIST(email.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isOpened ? (
                      <span
                        style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: 20,
                          background: '#ecfdf5',
                          color: '#059669',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        🟢 {email.openCount} {email.openCount === 1 ? 'Open' : 'Opens'}
                      </span>
                    ) : (
                      <span
                        style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: 20,
                          background: '#f1f5f9',
                          color: '#64748b',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        ⚪ Unopened
                      </span>
                    )}

                    {isClicked && (
                      <span
                        style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: 20,
                          background: '#f5f3ff',
                          color: '#7c3aed',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        ⚡ {email.clickCount} {email.clickCount === 1 ? 'Click' : 'Clicks'}
                      </span>
                    )}

                    <DeleteEmailButton id={email.id} />
                  </div>
                </summary>

                {/* Expanded Details */}
                <div style={{ padding: '0 1.1rem 1rem', borderTop: '1px solid #f1f5f9', fontSize: '0.85rem' }}>
                  {/* Opens Log */}
                  <div style={{ marginTop: '0.75rem' }}>
                    <div style={{ fontWeight: 700, color: '#334155', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>👁️</span> Open Activity History ({email.opens.length})
                    </div>
                    {email.opens.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {email.opens.map((o, idx) => {
                          const tag = CLASSIFICATION_LABEL[o.classification] || CLASSIFICATION_LABEL.recipient;
                          return (
                            <div
                              key={idx}
                              style={{
                                padding: '0.5rem 0.75rem',
                                background: '#f8fafc',
                                borderRadius: 6,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '0.4rem',
                              }}
                            >
                              <div>
                                <span style={{ fontWeight: 600, color: '#1e293b' }}>{formatIST(o.openedAt)}</span>
                                <span
                                  style={{
                                    marginLeft: '0.5rem',
                                    padding: '0.15rem 0.45rem',
                                    borderRadius: 4,
                                    background: tag.bg,
                                    color: tag.color,
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                  }}
                                >
                                  {tag.text}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                IP: <code>{o.ip || 'unknown'}</code> · Device: <span>{o.userAgent || 'unknown'}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p style={{ margin: 0, color: '#94a3b8', fontStyle: 'italic' }}>
                        No opens detected yet.
                      </p>
                    )}
                  </div>

                  {/* Clicks Log */}
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ fontWeight: 700, color: '#334155', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>🎯</span> Link & Button Clicks ({email.clicks.length})
                    </div>
                    {email.clicks.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {email.clicks.map((c, idx) => {
                          const tag = CLASSIFICATION_LABEL[c.classification] || CLASSIFICATION_LABEL.recipient;
                          return (
                            <div
                              key={idx}
                              style={{
                                padding: '0.5rem 0.75rem',
                                background: '#faf5ff',
                                borderRadius: 6,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '0.4rem',
                              }}
                            >
                              <div>
                                <span style={{ fontWeight: 600, color: '#1e293b' }}>{formatIST(c.clickedAt)}</span>
                                <span
                                  style={{
                                    marginLeft: '0.5rem',
                                    padding: '0.15rem 0.45rem',
                                    borderRadius: 4,
                                    background: tag.bg,
                                    color: tag.color,
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                  }}
                                >
                                  {tag.text}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                <span>{c.destination}</span> · IP: <code>{c.ip || 'unknown'}</code>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p style={{ margin: 0, color: '#94a3b8', fontStyle: 'italic' }}>
                        No link clicks recorded yet.
                      </p>
                    )}
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}
