# Email Open Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal tool that records when a manually-sent email is opened (timestamp + count) via a tracking pixel, with a dashboard to view results.

**Architecture:** New standalone Next.js 16 App Router project (`email-tracker`, sibling of `surprise-tracker`), Mongoose against the same MongoDB Atlas cluster in a new `email-tracker` database. Two collections (`TrackedEmail`, `OpenEvent`). A `GET /api/track/open/[id]` route serves a 1×1 GIF and logs an open event; a dashboard page lists tracked emails with open stats.

**Tech Stack:** Next.js 16.3.0, React 19.2.8, Mongoose 9.9.2, Vitest + mongodb-memory-server (tests only).

## Global Constraints

- Same versions as `surprise-tracker`: `next@^16.3.0`, `react@^19.2.8`, `react-dom@^19.2.8`, `mongoose@^9.9.2`.
- MongoDB connection **must** use the standard (non-SRV) `mongodb://` connection string — `mongodb+srv://` SRV DNS lookups fail inside this network's Next.js/Turbopack dev process (confirmed on `surprise-tracker`).
- No email sending, no link-click tracking, no read-duration measurement, no auth. Only open timestamp + open count (see spec's Non-goals).
- Personal single-user tool — no login/session system.

Spec: `docs/superpowers/specs/2026-08-12-email-open-tracker-design.md`

---

### Task 1: Project scaffold — Next.js app boots

**Files:**
- Create: `package.json`
- Create: `jsconfig.json`
- Create: `.gitignore`
- Create: `.env.local.example`
- Create: `app/layout.js`
- Create: `app/page.js`

**Interfaces:**
- Produces: a bootable Next.js app serving `/` with a placeholder heading. `app/page.js`'s default export will be replaced in Task 8.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "email-tracker",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3100",
    "build": "next build",
    "start": "next start -p 3100"
  },
  "dependencies": {
    "next": "^16.3.0",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "mongoose": "^9.9.2"
  }
}
```

- [ ] **Step 2: Create `jsconfig.json`**

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

- [ ] **Step 3: Create `.gitignore`**

```
node_modules/
.next/
.env.local
```

- [ ] **Step 4: Create `.env.local.example`**

```
MONGODB_URI=your-mongodb-connection-string-here
```

- [ ] **Step 5: Create `app/layout.js`**

```jsx
export const metadata = {
  title: 'Email Tracker',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 6: Create `app/page.js` (placeholder — replaced in Task 8)**

```jsx
export default function DashboardPage() {
  return <h1>Email Tracker</h1>;
}
```

- [ ] **Step 7: Install dependencies**

Run: `npm install`
Expected: installs without error, creates `node_modules/` and `package-lock.json`.

- [ ] **Step 8: Boot the dev server and verify the placeholder page**

Run (background): `npm run dev`
Wait ~2s for "Ready", then:
Run: `curl -s http://localhost:3100/`
Expected: HTML response containing `<h1>Email Tracker</h1>`.

Stop the dev server (`taskkill //PID <pid> //F` on Windows, or Ctrl+C) before continuing.

- [ ] **Step 9: Commit**

```bash
git add package.json jsconfig.json .gitignore .env.local.example app/layout.js app/page.js package-lock.json
git commit -m "Scaffold Next.js app"
```

---

### Task 2: MongoDB connection helper + test setup

**Files:**
- Create: `lib/db.js`
- Create: `vitest.config.js`
- Create: `tests/db.test.js`
- Modify: `package.json` (add `test` script + devDependencies)

**Interfaces:**
- Produces: `connectDB(): Promise<typeof import('mongoose')>` — connects using `process.env.MONGODB_URI`, caches the connection on `global._mongoose` so repeated calls reuse it. Throws if `MONGODB_URI` is unset.

- [ ] **Step 1: Add test dependencies**

Run: `npm install -D vitest mongodb-memory-server`

- [ ] **Step 2: Add the `test` script to `package.json`**

In the `"scripts"` object, add:

```json
"test": "vitest run"
```

- [ ] **Step 3: Create `vitest.config.js`**

```js
import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: 'node',
    testTimeout: 30000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
```

- [ ] **Step 4: Write the failing test — `tests/db.test.js`**

```js
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri('email-tracker-test');
});

afterAll(async () => {
  await mongod.stop();
});

describe('connectDB', () => {
  it('connects to MongoDB and caches the connection', async () => {
    const { connectDB } = await import('../lib/db.js');
    const conn1 = await connectDB();
    const conn2 = await connectDB();
    expect(conn1).toBe(conn2);
    expect(conn1.connection.readyState).toBe(1);
  });
});
```

- [ ] **Step 5: Run test to verify it fails**

Run: `npx vitest run tests/db.test.js`
Expected: FAIL — `Cannot find module '../lib/db.js'` (or similar), because `lib/db.js` doesn't exist yet.

- [ ] **Step 6: Create `lib/db.js`**

```js
// lib/db.js
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

let cached = global._mongoose;
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!MONGODB_URI) {
    throw new Error('Missing MONGODB_URI — set it in .env.local (and in Vercel env vars after deploy)');
  }
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npx vitest run tests/db.test.js`
Expected: PASS (1 test).

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json vitest.config.js lib/db.js tests/db.test.js
git commit -m "Add MongoDB connection helper with cached-connection test"
```

---

### Task 3: Mongoose models — TrackedEmail and OpenEvent

**Files:**
- Create: `lib/models/TrackedEmail.js`
- Create: `lib/models/OpenEvent.js`
- Create: `tests/models.test.js`

**Interfaces:**
- Consumes: `connectDB` from `lib/db.js` (Task 2).
- Produces: `TrackedEmail` Mongoose model — fields `label` (String, optional), `createdAt` (Date, default now).
- Produces: `OpenEvent` Mongoose model — fields `trackedEmailId` (ObjectId, ref `TrackedEmail`, required, indexed), `openedAt` (Date, default now), `ip` (String), `userAgent` (String).

- [ ] **Step 1: Write the failing test — `tests/models.test.js`**

```js
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri('email-tracker-test');
  const { connectDB } = await import('../lib/db.js');
  await connectDB();
});

afterAll(async () => {
  await mongod.stop();
});

describe('TrackedEmail model', () => {
  it('creates a document with an optional label and a default createdAt', async () => {
    const { TrackedEmail } = await import('../lib/models/TrackedEmail.js');
    const doc = await TrackedEmail.create({ label: 'Follow-up to Priya' });
    expect(doc._id).toBeDefined();
    expect(doc.label).toBe('Follow-up to Priya');
    expect(doc.createdAt).toBeInstanceOf(Date);
  });

  it('allows creating a document with no label', async () => {
    const { TrackedEmail } = await import('../lib/models/TrackedEmail.js');
    const doc = await TrackedEmail.create({});
    expect(doc._id).toBeDefined();
    expect(doc.label).toBeUndefined();
  });
});

describe('OpenEvent model', () => {
  it('requires trackedEmailId and defaults openedAt to now', async () => {
    const { TrackedEmail } = await import('../lib/models/TrackedEmail.js');
    const { OpenEvent } = await import('../lib/models/OpenEvent.js');
    const email = await TrackedEmail.create({ label: 'Test' });
    const event = await OpenEvent.create({
      trackedEmailId: email._id,
      ip: '1.2.3.4',
      userAgent: 'TestAgent/1.0',
    });
    expect(event._id).toBeDefined();
    expect(event.trackedEmailId.toString()).toBe(email._id.toString());
    expect(event.openedAt).toBeInstanceOf(Date);
  });

  it('rejects an OpenEvent with no trackedEmailId', async () => {
    const { OpenEvent } = await import('../lib/models/OpenEvent.js');
    await expect(
      OpenEvent.create({ ip: '1.2.3.4', userAgent: 'TestAgent/1.0' })
    ).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/models.test.js`
Expected: FAIL — `Cannot find module '../lib/models/TrackedEmail.js'`.

- [ ] **Step 3: Create `lib/models/TrackedEmail.js`**

```js
// lib/models/TrackedEmail.js
import mongoose from 'mongoose';

const TrackedEmailSchema = new mongoose.Schema({
  label: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const TrackedEmail =
  mongoose.models.TrackedEmail || mongoose.model('TrackedEmail', TrackedEmailSchema);
```

- [ ] **Step 4: Create `lib/models/OpenEvent.js`**

```js
// lib/models/OpenEvent.js
import mongoose from 'mongoose';

const OpenEventSchema = new mongoose.Schema({
  trackedEmailId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrackedEmail',
    required: true,
    index: true,
  },
  openedAt: { type: Date, default: Date.now },
  ip: { type: String },
  userAgent: { type: String },
});

export const OpenEvent =
  mongoose.models.OpenEvent || mongoose.model('OpenEvent', OpenEventSchema);
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/models.test.js`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add lib/models/TrackedEmail.js lib/models/OpenEvent.js tests/models.test.js
git commit -m "Add TrackedEmail and OpenEvent Mongoose models"
```

---

### Task 4: Tracking pixel helper

**Files:**
- Create: `lib/pixel.js`
- Create: `tests/pixel.test.js`

**Interfaces:**
- Produces: `TRANSPARENT_GIF: Buffer` — a 34-byte valid 1×1 transparent GIF89a image.
- Produces: `pixelResponse(): Response` — a `Response` with status 200, `Content-Type: image/gif`, `Cache-Control: no-store, no-cache, must-revalidate`, and body `TRANSPARENT_GIF`.

- [ ] **Step 1: Write the failing test — `tests/pixel.test.js`**

```js
import { describe, it, expect } from 'vitest';

describe('TRANSPARENT_GIF', () => {
  it('is a valid 1x1 GIF89a image', async () => {
    const { TRANSPARENT_GIF } = await import('../lib/pixel.js');
    expect(TRANSPARENT_GIF.length).toBe(34);
    expect(TRANSPARENT_GIF.slice(0, 6).toString('ascii')).toBe('GIF89a');
    expect(TRANSPARENT_GIF.readUInt16LE(6)).toBe(1);
    expect(TRANSPARENT_GIF.readUInt16LE(8)).toBe(1);
  });
});

describe('pixelResponse', () => {
  it('returns a Response with image/gif content type and no-cache headers', async () => {
    const { pixelResponse, TRANSPARENT_GIF } = await import('../lib/pixel.js');
    const res = pixelResponse();
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('image/gif');
    expect(res.headers.get('Cache-Control')).toBe('no-store, no-cache, must-revalidate');
    const body = Buffer.from(await res.arrayBuffer());
    expect(body.equals(TRANSPARENT_GIF)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/pixel.test.js`
Expected: FAIL — `Cannot find module '../lib/pixel.js'`.

- [ ] **Step 3: Create `lib/pixel.js`**

```js
// lib/pixel.js
// Smallest valid tracking pixel: a 34-byte 1x1 transparent GIF89a image.
export const TRANSPARENT_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
  'base64'
);

export function pixelResponse() {
  return new Response(TRANSPARENT_GIF, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Content-Length': String(TRANSPARENT_GIF.length),
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/pixel.test.js`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/pixel.js tests/pixel.test.js
git commit -m "Add tracking pixel helper"
```

---

### Task 5: POST /api/emails route

**Files:**
- Create: `app/api/emails/route.js`
- Create: `tests/api-emails.test.js`

**Interfaces:**
- Consumes: `connectDB` from `lib/db.js` (Task 2), `TrackedEmail` from `lib/models/TrackedEmail.js` (Task 3).
- Produces: `POST(req: Request): Promise<Response>` — reads JSON body `{ label?: string }`, creates a `TrackedEmail`, returns `Response.json({ id: string })`.

- [ ] **Step 1: Write the failing test — `tests/api-emails.test.js`**

```js
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri('email-tracker-test');
});

afterAll(async () => {
  await mongod.stop();
});

describe('POST /api/emails', () => {
  it('creates a TrackedEmail and returns its id', async () => {
    const { POST } = await import('../app/api/emails/route.js');
    const { TrackedEmail } = await import('../lib/models/TrackedEmail.js');

    const req = new Request('http://localhost/api/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: 'Follow-up to Priya' }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(json.id).toBeDefined();

    const saved = await TrackedEmail.findById(json.id);
    expect(saved.label).toBe('Follow-up to Priya');
  });

  it('creates a TrackedEmail with no label when the body omits it', async () => {
    const { POST } = await import('../app/api/emails/route.js');

    const req = new Request('http://localhost/api/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(json.id).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/api-emails.test.js`
Expected: FAIL — `Cannot find module '../app/api/emails/route.js'`.

- [ ] **Step 3: Create `app/api/emails/route.js`**

```js
// app/api/emails/route.js
import { connectDB } from '@/lib/db';
import { TrackedEmail } from '@/lib/models/TrackedEmail';

export async function POST(req) {
  await connectDB();

  const body = await req.json().catch(() => ({}));
  const label = typeof body.label === 'string' && body.label.trim() ? body.label.trim() : undefined;

  const email = await TrackedEmail.create({ label });

  return Response.json({ id: email._id.toString() });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/api-emails.test.js`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add app/api/emails/route.js tests/api-emails.test.js
git commit -m "Add POST /api/emails route"
```

---

### Task 6: GET /api/track/open/[id] route (the pixel endpoint)

**Files:**
- Create: `app/api/track/open/[id]/route.js`
- Create: `tests/api-track-open.test.js`

**Interfaces:**
- Consumes: `connectDB` (Task 2), `TrackedEmail` (Task 3), `OpenEvent` (Task 3), `pixelResponse` (Task 4).
- Produces: `GET(req: Request, context: { params: Promise<{ id: string }> }): Promise<Response>` — always returns the tracking pixel; logs an `OpenEvent` only when `id` matches an existing `TrackedEmail`.

- [ ] **Step 1: Write the failing test — `tests/api-track-open.test.js`**

```js
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri('email-tracker-test');
});

afterAll(async () => {
  await mongod.stop();
});

describe('GET /api/track/open/[id]', () => {
  it('logs an OpenEvent and returns the tracking pixel for a known id', async () => {
    const { GET } = await import('../app/api/track/open/[id]/route.js');
    const { TrackedEmail } = await import('../lib/models/TrackedEmail.js');
    const { OpenEvent } = await import('../lib/models/OpenEvent.js');
    const { TRANSPARENT_GIF } = await import('../lib/pixel.js');

    const email = await TrackedEmail.create({ label: 'Test' });

    const req = new Request(`http://localhost/api/track/open/${email._id}`, {
      headers: { 'x-forwarded-for': '9.9.9.9', 'user-agent': 'TestAgent/1.0' },
    });

    const res = await GET(req, { params: Promise.resolve({ id: email._id.toString() }) });

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('image/gif');
    const body = Buffer.from(await res.arrayBuffer());
    expect(body.equals(TRANSPARENT_GIF)).toBe(true);

    const events = await OpenEvent.find({ trackedEmailId: email._id });
    expect(events.length).toBe(1);
    expect(events[0].ip).toBe('9.9.9.9');
    expect(events[0].userAgent).toBe('TestAgent/1.0');
  });

  it('returns the pixel without logging when the id does not exist', async () => {
    const { GET } = await import('../app/api/track/open/[id]/route.js');
    const { OpenEvent } = await import('../lib/models/OpenEvent.js');
    const mongoose = (await import('mongoose')).default;

    const fakeId = new mongoose.Types.ObjectId().toString();
    const req = new Request(`http://localhost/api/track/open/${fakeId}`);
    const res = await GET(req, { params: Promise.resolve({ id: fakeId }) });

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('image/gif');
    const events = await OpenEvent.find({ trackedEmailId: fakeId });
    expect(events.length).toBe(0);
  });

  it('returns the pixel without throwing when the id is malformed', async () => {
    const { GET } = await import('../app/api/track/open/[id]/route.js');
    const req = new Request('http://localhost/api/track/open/not-a-valid-id');
    const res = await GET(req, { params: Promise.resolve({ id: 'not-a-valid-id' }) });

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('image/gif');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/api-track-open.test.js`
Expected: FAIL — `Cannot find module '../app/api/track/open/[id]/route.js'`.

- [ ] **Step 3: Create `app/api/track/open/[id]/route.js`**

```js
// app/api/track/open/[id]/route.js
import { connectDB } from '@/lib/db';
import { TrackedEmail } from '@/lib/models/TrackedEmail';
import { OpenEvent } from '@/lib/models/OpenEvent';
import { pixelResponse } from '@/lib/pixel';

export async function GET(req, context) {
  const { id } = await context.params;

  try {
    await connectDB();
    const email = await TrackedEmail.findById(id);
    if (email) {
      await OpenEvent.create({
        trackedEmailId: email._id,
        ip: req.headers.get('x-forwarded-for') ?? '',
        userAgent: req.headers.get('user-agent') ?? '',
      });
    }
  } catch (err) {
    console.error('track/open failed:', err.message);
  }

  return pixelResponse();
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/api-track-open.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add "app/api/track/open/[id]/route.js" tests/api-track-open.test.js
git commit -m "Add tracking pixel GET route"
```

---

### Task 7: Open-stats aggregation helper

**Files:**
- Create: `lib/emailStats.js`
- Create: `tests/emailStats.test.js`

**Interfaces:**
- Consumes: `TrackedEmail`, `OpenEvent` (Task 3).
- Produces: `getEmailsWithStats(): Promise<Array<{ id: string, label: string|undefined, createdAt: Date, openCount: number, lastOpenedAt: Date|null, opens: Date[] }>>` — all tracked emails, newest first, each with its open count, last-opened timestamp, and full list of open timestamps (oldest first).

- [ ] **Step 1: Write the failing test — `tests/emailStats.test.js`**

```js
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri('email-tracker-test');
  const { connectDB } = await import('../lib/db.js');
  await connectDB();
});

afterAll(async () => {
  await mongod.stop();
});

describe('getEmailsWithStats', () => {
  it('returns emails newest-first with open count and last-opened timestamp', async () => {
    const { TrackedEmail } = await import('../lib/models/TrackedEmail.js');
    const { OpenEvent } = await import('../lib/models/OpenEvent.js');
    const { getEmailsWithStats } = await import('../lib/emailStats.js');

    const older = await TrackedEmail.create({ label: 'Older email' });
    await new Promise((r) => setTimeout(r, 10));
    const newer = await TrackedEmail.create({ label: 'Newer email' });

    await OpenEvent.create({ trackedEmailId: older._id, openedAt: new Date('2026-01-01T10:00:00Z') });
    await OpenEvent.create({ trackedEmailId: older._id, openedAt: new Date('2026-01-02T10:00:00Z') });

    const stats = await getEmailsWithStats();

    expect(stats[0].id).toBe(newer._id.toString());
    expect(stats[0].openCount).toBe(0);
    expect(stats[0].lastOpenedAt).toBeNull();

    expect(stats[1].id).toBe(older._id.toString());
    expect(stats[1].openCount).toBe(2);
    expect(stats[1].lastOpenedAt.toISOString()).toBe('2026-01-02T10:00:00.000Z');
    expect(stats[1].opens.length).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/emailStats.test.js`
Expected: FAIL — `Cannot find module '../lib/emailStats.js'`.

- [ ] **Step 3: Create `lib/emailStats.js`**

```js
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/emailStats.test.js`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add lib/emailStats.js tests/emailStats.test.js
git commit -m "Add open-stats aggregation helper"
```

---

### Task 8: Dashboard page, New Email form, and end-to-end verification

**Files:**
- Create: `components/NewEmailForm.js`
- Modify: `app/page.js` (replace Task 1 placeholder)
- Create: `.env.local` (not committed — gitignored)

**Interfaces:**
- Consumes: `connectDB` (Task 2), `getEmailsWithStats` (Task 7), `NewEmailForm` (this task).
- No new exports consumed by later tasks — this is the last task.

- [ ] **Step 1: Create `components/NewEmailForm.js`**

```jsx
'use client';

import { useState } from 'react';

export default function NewEmailForm({ origin }) {
  const [label, setLabel] = useState('');
  const [snippet, setSnippet] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label }),
      });
      if (!res.ok) throw new Error('Request failed');
      const { id } = await res.json();
      const url = `${origin}/api/track/open/${id}`;
      setSnippet({
        url,
        html: `<img src="${url}" width="1" height="1" style="display:none" alt="" />`,
      });
      setLabel('');
    } catch (err) {
      setError('Could not create tracked email. Try again.');
    }
  }

  return (
    <div style={{ marginBottom: '2rem' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          placeholder="Label (optional) — e.g. Follow-up to Priya"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          style={{ flex: 1, padding: '0.5rem' }}
        />
        <button type="submit">+ New Tracked Email</button>
      </form>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {snippet && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#f4f4f4' }}>
          <p>Paste this into your email (Gmail: Insert Image → By URL):</p>
          <code style={{ display: 'block', wordBreak: 'break-all' }}>{snippet.url}</code>
          <textarea readOnly value={snippet.html} style={{ width: '100%', marginTop: '0.5rem' }} rows={2} />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Replace `app/page.js`**

```jsx
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
```

- [ ] **Step 3: Create `.env.local` (gitignored — never committed)**

Copy the `MONGODB_URI` value from `../surprise-tracker/.env.local`, and change only the database-name path segment from `/etaar` to `/email-tracker` (same cluster, same credentials, new database). Do not type the credentials into any committed file.

- [ ] **Step 4: Boot the dev server**

Run (background): `npm run dev`
Wait for "Ready", then confirm no errors in the log output.

- [ ] **Step 5: Verify the create-and-track flow via curl**

```bash
RESP=$(curl -s -X POST http://localhost:3100/api/emails -H "Content-Type: application/json" -d '{"label":"smoke-test"}')
echo "$RESP"
ID=$(echo "$RESP" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
curl -s -o /dev/null -w "pixel status: %{http_code}\n" http://localhost:3100/api/track/open/$ID
curl -s http://localhost:3100/ | grep -o 'smoke-test'
curl -s http://localhost:3100/ | grep -o '1 opens'
```

Expected: `RESP` contains an `id`; pixel status is `200`; the dashboard HTML contains `smoke-test` and `1 opens`.

- [ ] **Step 6: Clean up the smoke-test record**

```bash
cd "c:\Users\Prince tripathi\Desktop\project2\email-tracker" && node --env-file=.env.local -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  await mongoose.connection.db.collection('trackedemails').deleteMany({label:'smoke-test'});
  await mongoose.connection.db.collection('openevents').deleteMany({});
  process.exit(0);
});
"
```

(Requires `require`/CommonJS interop for this one-off script — if it errors on `require`, rename to `.cjs` temporarily or use `import()`.)

- [ ] **Step 7: Manual verification — real email**

Open `http://localhost:3100/` in a browser, click "+ New Tracked Email" with a real label, copy the pixel URL, paste it into a Gmail draft (Insert Image → By URL), send it to a second inbox you control, open it there, and confirm the dashboard shows 1 open with a timestamp. This exercises the real-world path curl cannot (an actual email client fetching the pixel).

- [ ] **Step 8: Stop the dev server and commit**

```bash
git add components/NewEmailForm.js app/page.js
git commit -m "Add dashboard page and new-tracked-email form"
```

---

## Self-Review Notes

- **Spec coverage:** Architecture/DB choice → Tasks 1–2. Data model → Task 3. Pixel endpoint + cache headers + silent-failure edge cases → Tasks 4, 6. Create-email API → Task 5. Dashboard with expandable open history → Tasks 7–8. Testing plan (pixel curl, real Gmail send/open, re-open check) → Task 8 Steps 5 and 7. Deferred WhatsApp/click-tracking/auth → intentionally no tasks.
- **Placeholder scan:** none found — every step has runnable code or exact commands.
- **Type consistency:** `TrackedEmail`/`OpenEvent` field names and `getEmailsWithStats()`'s return shape are identical across Tasks 3, 6, 7, 8.
