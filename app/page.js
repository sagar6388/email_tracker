import { headers, cookies } from 'next/headers';
import { connectDB } from '@/lib/db';
import { getEmailsWithStats } from '@/lib/emailStats';
import { verifyToken } from '@/lib/auth';
import AdminLoginForm from '@/components/AdminLoginForm';
import LogoutButton from '@/components/LogoutButton';
import SendEmailForm from '@/components/SendEmailForm';
import NewEmailForm from '@/components/NewEmailForm';
import TestModeButton from '@/components/TestModeButton';
import EmailList from '@/components/EmailList';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // 1. Password Protection Check
  const cookieStore = await cookies();
  const authToken = cookieStore.get('admin_auth')?.value;

  if (!verifyToken(authToken)) {
    return <AdminLoginForm />;
  }

  // 2. Fetch Emails & Analytics
  await connectDB();
  const emails = await getEmailsWithStats();

  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = host?.startsWith('localhost') ? 'http' : 'https';
  const origin = `${protocol}://${host}`;

  // 3. Compute KPI Summary Stats
  const totalEmails = emails.length;
  const totalOpens = emails.reduce((acc, e) => acc + (e.openCount || 0), 0);
  const totalClicks = emails.reduce((acc, e) => acc + (e.clickCount || 0), 0);
  const openedEmails = emails.filter((e) => (e.openCount || 0) > 0).length;
  const openRate = totalEmails > 0 ? ((openedEmails / totalEmails) * 100).toFixed(1) : 0;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
        color: '#1e293b',
        padding: '2rem 1rem 4rem',
      }}
    >
      <main style={{ maxWidth: 860, margin: '0 auto' }}>
        {/* Top Navbar / Header */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            paddingBottom: '1.5rem',
            marginBottom: '1.5rem',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.6rem' }}>⚡</span>
              <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
                AstroVeda Email Tracker
              </h1>
            </div>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              Real-time Open & Click Analytics • Secure Admin Portal
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#059669',
                background: '#ecfdf5',
                padding: '0.3rem 0.65rem',
                borderRadius: 20,
                border: '1px solid #a7f3d0',
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981' }}></span>
              Live DB
            </span>
            <LogoutButton />
          </div>
        </header>

        {/* KPI Metrics Summary Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            marginBottom: '1.75rem',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: '1.1rem',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Tracked Emails
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
              {totalEmails}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>Total dispatched</div>
          </div>

          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: '1.1rem',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Opens
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669', marginTop: '0.25rem' }}>
              {totalOpens}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '0.2rem', fontWeight: 600 }}>
              {openRate}% open rate
            </div>
          </div>

          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: '1.1rem',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Clicks
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#7c3aed', marginTop: '0.25rem' }}>
              {totalClicks}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>Telegram/CTA actions</div>
          </div>

          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: '1.1rem',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Quick Test Mode
            </div>
            <div style={{ marginTop: '0.4rem' }}>
              <TestModeButton />
            </div>
          </div>
        </div>

        {/* 1. Main Action: Compose & Send Email */}
        <SendEmailForm />

        {/* 2. Secondary Action: Manual Snippet Generator (Collapsible) */}
        <details
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: '0.85rem 1.1rem',
            marginBottom: '1.5rem',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
          }}
        >
          <summary style={{ cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', color: '#475569' }}>
            🔗 Or Generate Manual Tracking Pixel & Link (For pasting in Gmail web directly)
          </summary>
          <div style={{ marginTop: '0.75rem' }}>
            <NewEmailForm origin={origin} />
          </div>
        </details>

        {/* 3. Realtime Email List & Activity Logs */}
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
              📊 Tracked Emails & Live Activity
            </h2>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {emails.length} {emails.length === 1 ? 'campaign' : 'campaigns'}
            </span>
          </div>
          <EmailList emails={emails} />
        </div>
      </main>
    </div>
  );
}
