# StudyCircle

A social accountability study platform. Students enter a subject, join a small weekly
group, meet, review last week's goals, set next week's goals, and get help when they
fall behind.

The whole platform is modelled as a circle:

```
                    StudyCircle
              (the whole platform)

        Mathematics
        ────────────────
   Biology ──────────── Physics
        ────────────────
        Computer Science
```

- **Circle** — the whole platform. Rendered on the homepage as real SVG chords.
- **Chord** — a subject community (Biology, Physics, SAT Preparation, …) with its own
  dashboard, schedule, point directory, and member panel.
- **Point** — a small weekly study group inside a chord. Where meetings, goals, chat,
  and SOS support happen.

## Stack

Next.js 16 (App Router) · TypeScript · React 19 · Tailwind CSS 4 · pnpm.

## Quick start

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000. No environment variables and no external services are
needed: the app runs on an in-memory store with seeded demo data, and both optional
integrations are off.

Sign in from `/login` by picking a demo account (no password). **Maya Chen** and
**Dev Patel** are the site creators and moderate points.

### Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Dev server on :3000 |
| `pnpm build` | Production build (also typechecks) |
| `pnpm start` | Serve the production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |

There is no test suite yet. The seed data in `lib/database/seed.ts` doubles as the
fixture set; verify changes with `pnpm lint && pnpm build` plus a click-through of
`/` → chord → point → meeting room.

## Project layout

```
app/                     routes: /, /login, /chords, /chords/[id], /points/[id],
                         /points/[id]/meeting, /dashboard, /moderator, /profile
components/
  ui/                    Button, Card, Modal, Avatar, ProgressBar, Badge, Field,
                         StatusBadge, ActionForm
  circle/                StudyCircle (SVG chord diagram)
  chord/                 ChordCard, AudienceFilter, MemberPanel, CreatePointForm
  point/                 PointCard, SOSButton, SupportNotification, HelpRequestCard,
                         ProgressUpdater
  schedule/              Calendar, ScheduleEvent, GoalCard, DeadlineCard
  chat/                  PointChat, ChatMessage, MessageInput, ChatSidebar,
                         SupportChat, PrivateMessage, HelpRequest
  moderator/             ModeratorPanel, UserCard
lib/
  api/                   actions.ts (all mutations), session.ts, profile.ts
  ai/                    openai.ts, mock.ts
  zoom/                  zoom.ts
  database/              store.ts, memory-store.ts, supabase-store.ts, client.ts,
                         repository.ts, seed.ts
  domain/                audience.ts, moderation.ts, progress.ts, schedule.ts, time.ts
config/                  features.ts, chords.ts, timezones.ts
hooks/                   useAudienceFilter.ts
types/                   index.ts (all domain types)
supabase/                schema.sql
```

## Core rules

**Vocabulary.** Use Circle, Chord, and Point in code, routes, and UI. Do not rename
them to "group", "subject", "channel", or "room".

**Reusable components only.** Never create a subject-specific variant. `BiologyPointCard`
is wrong; `PointCard` with props is right.

**All mutations go through server actions** in `lib/api/actions.ts`. Each action
re-checks the session and the permission it needs (membership, moderator, audience).

**Age filtering lives in one place.** `lib/domain/audience.ts` decides who can see and
join chords, points, and members, so the four surfaces cannot disagree. College groups
require members aged 18+.

**Every point has exactly one moderator.** Moderators are chosen from subject
familiarity, experience, past group success, and reputation (`lib/domain/moderation.ts`).
Creators moderate by default.

**Points are one-off weekly meetings for now**, stored as a `WeeklySchedule`
(weekday + time + timezone) so recurring groups can be added later without a migration.

## Feature toggles

`config/features.ts`:

```ts
export const FEATURES = {
  ENABLE_AI_MODERATOR: false,
  ENABLE_ZOOM_API: false,
};
```

**The app is fully functional with both flags off.** When they are off, no OpenAI key or
Zoom credentials are read and no external request is made; mock responses keep the flows
testable. To exercise the AI and Zoom code paths without spending money, call the
functions in `lib/ai/mock.ts` and the mock branches of `lib/zoom/zoom.ts`.

## Enabling AI moderation

1. Set `ENABLE_AI_MODERATOR: true` in `config/features.ts`.
2. Add your key to `.env.local`:

   ```
   AI_API_KEY=your-key
   AI_BASE_URL=https://openrouter.ai/api/v1   # optional; OpenAI-compatible
   AI_MODEL=openrouter/free                    # optional; provider default otherwise
   ```

`lib/ai/openai.ts` exposes `generateMeetingSummary`, `generateGoals`,
`analyzeStudentProgress`, batched `analyzePointStudents`, and `generateMotivationMessage`.
Each returns mock data while the flag is off, and calls the Chat Completions API (with JSON
responses) when it is on. The `OPENAI_API_KEY` / `OPENAI_BASE_URL` / `OPENAI_MODEL` names
are still accepted as fallbacks.

Intended use: read a meeting transcript, summarize it, extract what was completed, and
suggest next week's goals. Moderators still record goals by hand — the AI only proposes.

`runMeetingAssistant` accepts either pasted notes or a Zoom transcript, and
`analyzePointStudents` checks a whole point in one call. All AI output is on-demand, never
on page load, because free model tiers allow only tens of requests a day. The moderator
panel renders the assistant and risk panels; the dashboard shows the motivation card.

## Connecting an AI provider

The client speaks the OpenAI Chat Completions API, so it works with OpenAI, OpenRouter, or
any compatible server. For a free setup, create a key at https://openrouter.ai/keys, set
`AI_BASE_URL=https://openrouter.ai/api/v1`, and keep `AI_MODEL=openrouter/free`; `:free`
model ids such as `deepseek/deepseek-chat-v3:free` also work. For OpenAI, create a key at
https://platform.openai.com/api-keys and leave `AI_BASE_URL` unset.

Put the key in `.env.local` only and keep that file out of version control. The key is read
only in `lib/ai/openai.ts`, which is server-only and must never be imported from a client
component.

## Connecting Zoom

1. Set `ENABLE_ZOOM_API: true` in `config/features.ts`.
2. In the Zoom App Marketplace, create a **Server-to-Server OAuth** app and grant the
   `meeting:write:admin` and `cloud_recording:read:admin` scopes.
3. Add the credentials to `.env.local`:

   ```
   ZOOM_ACCOUNT_ID=...
   ZOOM_CLIENT_ID=...
   ZOOM_CLIENT_SECRET=...
   ```

`lib/zoom/zoom.ts` provides `createZoomMeeting`, `joinZoomMeeting`, `getMeetingTranscript`,
and `endMeeting`. Tokens are fetched with the account-credentials grant and cached in
memory. Transcripts need cloud recording with audio transcription enabled on the Zoom
account; otherwise `getMeetingTranscript` returns an empty string.

With the flag off, "Join meeting" opens the in-app **Demo Meeting Room** at
`/points/[id]/meeting`.

## Database

By default the app uses an in-memory store seeded from `lib/database/seed.ts`. It resets
when the server restarts, which is ideal for demos and development.

To use Supabase instead:

1. Create a project and run `supabase/schema.sql` in the SQL editor.
2. In **Authentication → Providers → Email**, turn **Confirm email** off (sign-up
   creates users with confirmation already applied, so this just keeps the flows
   consistent) and note the free tier's default 1-hour JWT expiry.
3. Set in `.env.local`:

   ```
   DATA_BACKEND=supabase
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_PUBLISHABLE_KEY=your-publishable-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

   `SUPABASE_PUBLISHABLE_KEY` (the anon/publishable key) is used by Supabase Auth; it is
   safe to expose, unlike the service role key.

The service role key bypasses row-level security and is server-only. `supabase/schema.sql`
creates the tables but **no seed rows** — a Supabase project starts empty, so create your
first account through `/login`.

Each table is `(id text primary key, data jsonb)`: the whole entity is one JSON document
matching `types/index.ts`. This keeps the store interface small, but it means there are no
cross-row constraints or SQL-level joins. Move to real columns when you need relational
queries, reporting, or row-level security per field.

## Authentication

Authentication follows the data backend (`lib/api/session.ts`):

- **`DATA_BACKEND=supabase`** — real email + password auth via **Supabase Auth**. The
  session is a signed JWT stored in Supabase's auth cookies (`@supabase/ssr`), so it
  cannot be forged. Sign-up creates the auth user with the service-role key
  (email confirmation bypassed, so no SMTP is required) and stores the profile row under
  the same id. Set all three variables from the Database section plus
  `SUPABASE_PUBLISHABLE_KEY`. Sessions last as long as your Supabase JWT expiry setting
  (default 1 hour; raise it under Auth → Settings for longer demos). Free tier includes
  50,000 monthly active users.
- **`DATA_BACKEND=memory`** (default) — the demo session: a plain `sc_user` cookie
  holding the signed-in user id, and the seeded accounts on `/login` are gated by the
  shared `DEMO_PASSWORD` ("demo1234", `lib/api/session.ts`). This is local-development
  auth only: never expose a memory-backend deployment publicly.

Password reset and email verification are not implemented (core auth only).

## Creating a new chord

Chords come from the catalog, not the database, so a new subject is a one-file change:

1. Append an entry to `CHORD_CATALOG` in `config/chords.ts` with a unique lowercase
   `id`, a `description`, a `color`, and an `audience` (`"all"`, `"high-school"`, or
   `"college"`).
2. Restart the app (or reset the in-memory store) so the seed picks it up.

The `id` is used in URLs and in `User.subjects`, so keep it a stable slug. The chord then
appears on the homepage circle, in `/chords`, and can host points.

## Creating a new point

No code changes needed. Sign in, open any chord, and use **Start a point** in the sidebar:
title, description, meeting day, time, and who can join. The point is created with a
meeting room (mock or Zoom), the creator as its first member, and the highest-scoring
eligible user as moderator.

## Extending components

Shared UI lives in `components/ui`. To add a component:

1. Put it in the folder matching its domain (`components/point`, `components/schedule`, …).
2. Accept data as props. Do not import the database or call server actions inside a
   component — read data in the page and pass it down.
3. Add `"use client"` only if the component needs state, effects, or event handlers.
   Client components cannot receive plain functions from a Server Component, so pass
   serializable data or a server action reference.
4. Reuse `Card`, `Button`, `Badge`, `Avatar`, and `ProgressBar` rather than restyling
   from scratch, and keep the rounded, friendly, academic tone. Avoid a corporate
   dashboard look.
