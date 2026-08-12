# Email Open Tracker — Design

## Goal

A personal tool to know when an email sent manually (via Gmail/Outlook) gets
opened by the recipient — timestamp of each open and total open count. This
is the classic "read receipt" tracking-pixel technique.

## Non-goals

- No email sending (SMTP/API integration). The user composes and sends
  emails themselves through their normal email client; this tool only
  generates the tracking pixel and records opens.
- No link click tracking.
- No exact read-duration measurement. Email clients strip `<script>` tags,
  so the `visibilitychange`/`sendBeacon` technique used in the sibling
  `surprise-tracker` project (page-view duration) is not possible here. Only
  open timestamps and open count are measurable — the same limitation every
  email-tracking product (Mailtrack, HubSpot Sales, etc.) has.
- No WhatsApp (or other) real-time notification on open. This was requested
  during design but explicitly deferred — see "Explicitly deferred" below.
- No multi-user auth. Personal, single-user tool, matching `surprise-tracker`.

## Architecture

A new standalone Next.js 16 project at `Desktop/project2/email-tracker`,
App Router, Mongoose ODM — same stack and conventions as the sibling
`surprise-tracker` project.

MongoDB: the same Atlas cluster already used by `surprise-tracker`, in a new
database named `email-tracker`. **Must use the standard (non-SRV)
`mongodb://` connection string**, not `mongodb+srv://`. On this network, SRV
DNS lookups (`querySrv`) fail inside the Next.js/Turbopack dev process even
though the same lookup succeeds from a plain `node -e` script and from the
OS-level `nslookup` — root cause not fully pinned down (suspected Turbopack
dev-server process/threading quirk), and setting `dns.setServers()` did not
fix it. The standard connection string (individual shard hosts +
`replicaSet`/`authSource` params, obtained by resolving the SRV/TXT records
once up front) sidesteps the issue entirely and is the proven working
pattern from `surprise-tracker`.

## Data model

Two Mongoose collections:

```
TrackedEmail
  _id
  label       String, optional — free-text note, e.g. "Follow-up to Priya"
  createdAt   Date, default now

OpenEvent
  _id
  trackedEmailId  ObjectId, ref TrackedEmail, indexed
  openedAt        Date, default now
  ip              String
  userAgent       String
```

Each "create tracked email" action produces its own `TrackedEmail` document
with its own id — including repeat emails to the same person. Tracking is
per-individual-send, not per-recipient.

## API routes

- `POST /api/emails` — body `{ label? }` → creates a `TrackedEmail`, returns
  `{ id }`.
- `GET /api/track/open/[id]` — the tracking pixel endpoint.
  - If `id` matches an existing `TrackedEmail`, logs an `OpenEvent`
    (`trackedEmailId = id`, `openedAt = now`, `ip` from
    `x-forwarded-for`, `userAgent` from the request header). If `id`
    doesn't match anything, silently skips logging — no error surfaced.
  - Always returns a valid 1×1 transparent GIF, `Content-Type: image/gif`,
    regardless of whether logging succeeded (a DB error must never break
    the image response).
  - Response headers include `Cache-Control: no-store, no-cache,
    must-revalidate` to discourage email-client image proxies (Gmail,
    Outlook) from serving a cached copy on repeat opens. Not guaranteed to
    work on every client — documented as a known limitation, not a bug to
    chase further.
- Dashboard data (list of tracked emails with computed open count + most
  recent open timestamp) is read directly by the dashboard page as a server
  component; no separate `GET /api/emails` endpoint is required unless the
  implementation plan finds it useful for the "create" form's client-side
  refresh.

## Dashboard (`/`)

Server-rendered page:

- Table of all `TrackedEmail` docs, newest first: label, created date, open
  count, last opened at.
- Each row expands (or links to a detail view) to show the full list of
  open timestamps for that email.
- "+ New Tracked Email" form: optional label input. On submit, creates the
  record and displays the pixel snippet to copy:
  ```html
  <img src="https://<deployed-domain>/api/track/open/<id>" width="1" height="1" style="display:none" alt="" />
  ```
  plus the bare pixel URL, for pasting into Gmail's compose "Insert Image →
  By URL" option (or the equivalent in other clients).

## Error handling / edge cases

- The pixel endpoint never errors visibly to the email client — it always
  returns the image, even for a malformed or unknown `id` (logging is just
  skipped).
- Multiple rapid pixel hits (some clients pre-fetch images) are logged as
  separate `OpenEvent`s as-is; no de-duplication. This matches how existing
  tools behave and avoids discarding genuine re-open signals.
- If MongoDB is unreachable, the pixel route still returns the image
  (best-effort logging; DB errors are swallowed, not surfaced).

## Testing plan

1. `curl` the pixel endpoint directly → confirm `Content-Type: image/gif`
   binary response, and a matching `OpenEvent` row appears in MongoDB.
2. Create a tracked email via the dashboard, copy the pixel URL, paste it
   into a real Gmail draft (Insert Image → By URL), send it to a second
   inbox the user controls, open it, and confirm the dashboard shows the
   open.
3. Re-open the same email (ideally from a different device/session) to
   observe whether a second `OpenEvent` is captured. Record the actual
   behavior as a known-limitations note rather than treating an undercount
   as a bug — Gmail/Outlook image-proxy caching behavior is outside this
   project's control.

## Explicitly deferred (not in this iteration)

- **WhatsApp open notification.** The user asked, mid-design, to get a
  WhatsApp message every time a tracked email is opened. The plan was to
  reuse the existing `gradenova/whatsapp-service` (a Baileys-based
  microservice with a `POST /sessions/:userId/send` REST endpoint). While
  investigating, two blockers surfaced: the service's `.env` `DATABASE_URL`
  was corrupted (truncated at `.../post>` instead of `.../postgres`) — this
  was fixed independently of this project — and the WhatsApp session for
  the candidate `userId` (22, `connected_number` `916388739217`) was found
  to be in `status: disconnected` (needs a fresh QR scan to relink). The
  user chose to skip this for now; it can be revisited once the WhatsApp
  session is relinked, by having the pixel route fire a fire-and-forget
  `POST` to the whatsapp-service `/sessions/22/send` endpoint after logging
  each `OpenEvent`.
- Link click tracking.
- Multi-user auth.
