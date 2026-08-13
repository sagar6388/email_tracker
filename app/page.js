import { headers } from 'next/headers';
import { connectDB } from '@/lib/db';
import { getEmailsWithStats } from '@/lib/emailStats';
import NewEmailForm from '@/components/NewEmailForm';

export const dynamic = 'force-dynamic';

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
      <NewEmailForm origin={origin} />
      <div>
        {emails.map((email) => (
          <details
            key={email.id}
            style={{ border: '1px solid #eee', borderRadius: 6, padding: '0.75rem', marginBottom: '0.5rem' }}
          >
            <summary style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
              <span>{email.label || '(no label)'}</span>
              <span>
                {email.openCount} opens
                {email.lastOpenedAt ? ` · last ${new Date(email.lastOpenedAt).toLocaleString()}` : ''}
              </span>
            </summary>
            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#555' }}>
              <p>Created {new Date(email.createdAt).toLocaleString()}</p>
              {email.opens.length > 0 ? (
                <ul>
                  {email.opens.map((t, i) => (
                    <li key={i}>{new Date(t).toLocaleString()}</li>
                  ))}
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
