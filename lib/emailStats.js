// lib/emailStats.js
import { TrackedEmail } from './models/TrackedEmail.js';
import { OpenEvent } from './models/OpenEvent.js';
import { ClickEvent } from './models/ClickEvent.js';
import { TestSession } from './models/TestSession.js';

const AUTOMATED_WINDOW_MS = 5 * 60 * 1000;

function classifyEvent(eventTime, emailCreatedAt, testSessions, crossEmailSeconds) {
  const t = new Date(eventTime).getTime();

  const inTestSession = testSessions.some(
    (ts) => t >= new Date(ts.startedAt).getTime() && t <= new Date(ts.expiresAt).getTime()
  );
  if (inTestSession) return 'self-test';

  if (t - new Date(emailCreatedAt).getTime() <= AUTOMATED_WINDOW_MS) return 'automated';

  const secondKey = Math.floor(t / 1000);
  if (crossEmailSeconds.has(secondKey)) return 'automated';

  return 'recipient';
}

function buildCrossEmailSecondsSet(events, timeField) {
  const secondGroups = new Map();
  for (const e of events) {
    const key = Math.floor(new Date(e[timeField]).getTime() / 1000);
    if (!secondGroups.has(key)) secondGroups.set(key, new Set());
    secondGroups.get(key).add(e.trackedEmailId.toString());
  }
  return new Set(
    [...secondGroups.entries()].filter(([, ids]) => ids.size > 1).map(([key]) => key)
  );
}

function groupByEmail(events) {
  const map = new Map();
  for (const e of events) {
    const key = e.trackedEmailId.toString();
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(e);
  }
  return map;
}

export async function getEmailsWithStats() {
  const emails = await TrackedEmail.find().sort({ createdAt: -1 }).lean();
  const allOpens = await OpenEvent.find().sort({ openedAt: 1 }).lean();
  const allClicks = await ClickEvent.find().sort({ clickedAt: 1 }).lean();
  const testSessions = await TestSession.find().lean();

  const openCrossSeconds = buildCrossEmailSecondsSet(allOpens, 'openedAt');
  const clickCrossSeconds = buildCrossEmailSecondsSet(allClicks, 'clickedAt');

  const opensByEmail = groupByEmail(allOpens);
  const clicksByEmail = groupByEmail(allClicks);

  return emails.map((email) => {
    const emailId = email._id.toString();
    const opens = opensByEmail.get(emailId) || [];
    const clicks = clicksByEmail.get(emailId) || [];

    return {
      id: emailId,
      label: email.label,
      createdAt: email.createdAt,
      openCount: opens.length,
      lastOpenedAt: opens.length ? opens[opens.length - 1].openedAt : null,
      opens: opens.map((o) => ({
        openedAt: o.openedAt,
        ip: o.ip,
        userAgent: o.userAgent,
        classification: classifyEvent(o.openedAt, email.createdAt, testSessions, openCrossSeconds),
      })),
      clickCount: clicks.length,
      lastClickedAt: clicks.length ? clicks[clicks.length - 1].clickedAt : null,
      clicks: clicks.map((c) => ({
        clickedAt: c.clickedAt,
        ip: c.ip,
        userAgent: c.userAgent,
        destination: c.destination,
        classification: classifyEvent(c.clickedAt, email.createdAt, testSessions, clickCrossSeconds),
      })),
    };
  });
}
