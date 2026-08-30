import { headers } from 'next/headers';
import { connectDB } from '@/lib/db';
import { getEmailsWithStats } from '@/lib/emailStats';
import NewEmailForm from '@/components/NewEmailForm';
import TestModeButton from '@/components/TestModeButton';
import DeleteEmailButton from '@/components/DeleteEmailButton';

export const dynamic = 'force-dynamic';

function formatIST(date) {
  return new Date(date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
}

const CLASSIFICATION_LABEL = {
  'self-test': { text: '✅ You (test)', color: '#2a8' },
  automated: { text: '⚠️ Likely automated', color: '#b80' },
  recipient: { text: '👤 Likely recipient', color: '#333' },
};

export default async function DashboardPage() {
  await connectDB();
  const emails = await getEmailsWithStats();

  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = host?.startsWith('localhost') ? 'http' : 'https';
  const origin = `${protocol}://${host}`;

  return (
    <main style={{ maxWidth: 720, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Email Tracker</h1>
      <TestModeButton />
      <NewEmailForm origin={origin} />
      <div>
        {emails.map((email) => (
          <details
            key={email.id}
            style={{ border: '1px solid #eee', borderRadius: 6, padding: '0.75rem', marginBottom: '0.5rem' }}
          >
            <summary style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
              <span>{email.label || '(no label)'}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>
                  {email.openCount} opens
                  {email.lastOpenedAt ? ` · last ${formatIST(email.lastOpenedAt)}` : ''}
                </span>
                <DeleteEmailButton id={email.id} />
              </span>
            </summary>
            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#555' }}>
              <p>Created {formatIST(email.createdAt)}</p>
              {email.opens.length > 0 ? (
                <ul style={{ paddingLeft: '1.2rem' }}>
                  {email.opens.map((o, i) => {
                    const label = CLASSIFICATION_LABEL[o.classification];
                    return (
                      <li key={i} style={{ marginBottom: '0.4rem' }}>
                        <div>
                          {formatIST(o.openedAt)}
                          {' — '}
                          <span style={{ color: label.color }}>{label.text}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#999' }}>
                          {o.ip || 'unknown ip'} · {o.userAgent || 'unknown device'}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p>Not opened yet.</p>
              )}
            </div>
          </details>
        ))}
        {emails.length === 0 && <p style={{ color: '#888' }}>No tracked emails yet.</p>}
      </div>
    </main>
  );
}
