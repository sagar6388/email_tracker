// lib/emailStats.js
import { TrackedEmail } from './models/TrackedEmail.js';
import { OpenEvent } from './models/OpenEvent.js';

export async function getEmailsWithStats() {
  const emails = await TrackedEmail.find().sort({ createdAt: -1 }).lean();

  return Promise.all(
    emails.map(async (email) => {
      const opens = await OpenEvent.find({ trackedEmailId: email._id })
        .sort({ openedAt: 1 })
        .lean();

      return {
        id: email._id.toString(),
        label: email.label,
        createdAt: email.createdAt,
        openCount: opens.length,
        lastOpenedAt: opens.length ? opens[opens.length - 1].openedAt : null,
        opens: opens.map((o) => o.openedAt),
      };
    })
  );
}
