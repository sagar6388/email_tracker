// lib/emailStats.js
import { TrackedEmail } from './models/TrackedEmail.js';
import { OpenEvent } from './models/OpenEvent.js';
import { TestSession } from './models/TestSession.js';

const AUTOMATED_WINDOW_MS = 5 * 60 * 1000;

function classifyOpen(openedAt, emailCreatedAt, testSessions, crossEmailSeconds) {
  const t = new Date(openedAt).getTime();

  const inTestSession = testSessions.some(
    (ts) => t >= new Date(ts.startedAt).getTime() && t <= new Date(ts.expiresAt).getTime()
  );
  if (inTestSession) return 'self-test';

  if (t - new Date(emailCreatedAt).getTime() <= AUTOMATED_WINDOW_MS) return 'automated';

  const secondKey = Math.floor(t / 1000);
  if (crossEmailSeconds.has(secondKey)) return 'automated';

  return 'recipient';
}

export async function getEmailsWithStats() {
  const emails = await TrackedEmail.find().sort({ createdAt: -1 }).lean();
  const allOpens = await OpenEvent.find().sort({ openedAt: 1 }).lean();
  const testSessions = await TestSession.find().lean();

  const secondGroups = new Map();
  for (const o of allOpens) {
    const key = Math.floor(new Date(o.openedAt).getTime() / 1000);
    if (!secondGroups.has(key)) secondGroups.set(key, new Set());
    secondGroups.get(key).add(o.trackedEmailId.toString());
  }
  const crossEmailSeconds = new Set(
    [...secondGroups.entries()].filter(([, ids]) => ids.size > 1).map(([key]) => key)
  );

  const opensByEmail = new Map();
  for (const o of allOpens) {
    const key = o.trackedEmailId.toString();
    if (!opensByEmail.has(key)) opensByEmail.set(key, []);
    opensByEmail.get(key).push(o);
  }

  return emails.map((email) => {
    const opens = opensByEmail.get(email._id.toString()) || [];

    return {
      id: email._id.toString(),
      label: email.label,
      createdAt: email.createdAt,
      openCount: opens.length,
      lastOpenedAt: opens.length ? opens[opens.length - 1].openedAt : null,
      opens: opens.map((o) => ({
        openedAt: o.openedAt,
        ip: o.ip,
        userAgent: o.userAgent,
        classification: classifyOpen(o.openedAt, email.createdAt, testSessions, crossEmailSeconds),
      })),
    };
  });
}
