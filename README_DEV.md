# OpenCircle Developer Guide

Everything you need to know to develop, test, and deploy OpenCircle. For end-user documentation, see [README.md](./README.md).

## Table of Contents

- [Quick Start](#quick-start)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Architecture & Rules](#architecture--rules)
- [Next.js 16 Gotchas](#nextjs-16-gotchas)
- [Feature Flags & Integrations](#feature-flags--integrations)
- [Database](#database)
- [Authentication](#authentication)
- [Branching, Merging & Agent Workflow](#branching-merging--agent-workflow)
- [Verification & Testing](#verification--testing)
- [Deployment (Vercel)](#deployment-vercel)
- [CI (GitHub Actions)](#ci-github-actions)
- [Troubleshooting](#troubleshooting)
- [Additional Resources](#additional-resources)

## Quick Start

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The app runs with the in-memory store and all feature flags off by default - no environment variables required.

## Tech Stack

| Technology | Version | Purpose |
| --- | --- | --- |
| [Next.js](https://nextjs.org/) | 16.4.2 | App Router framework |
| [React](https://react.dev/) | 19.3.0 | UI library |
| [TypeScript](https://www.typescriptlang.org/) | ^5 | Type safety |
| [Tailwind CSS](https://tailwindcss.com/) | ^4 | Styling |
| [pnpm](https://pnpm.io/) | 12.8.1 | Package manager |
| [Supabase](https://supabase.com/) | ^2.118.0 | Optional auth/database backend |

## Project Structure

```text
app/                     # App Router pages and layouts
├── (routes)/            # /, /login, /chords, /points, /dashboard, /moderator, /profile
components/
├── ui/                  # Reusable primitives (Button, Card, Badge, Avatar, ProgressBar, Modal, Field, etc.)
├── circle/              # Homepage SVG chord diagram
├── chord/               # Chord-related components
├── point/               # Point, chat, SOS, help requests
├── schedule/            # Calendar, goals, deadlines
├── chat/                # Point chat, private messages, support
├── moderator/           # Moderator tools
└── assistant/           # AI assistant panels (RiskPanel, MotivationCard, AssistantPanel)
config/
├── features.ts          # Feature flags (ENABLE_AI_MODERATOR, ENABLE_ZOOM_API)
├── chords.ts            # Chord catalog
└── timezones.ts         # Timezone definitions
hooks/                   # Shared React hooks
lib/
├── api/                 # Server actions (actions.ts), session management
├── ai/                  # AI provider (openai.ts), mocks
├── zoom/                # Zoom integration, mocks
├── database/            # DataStore interface, memory/supabase stores, repository, seed
└── domain/              # Core logic (audience, moderation, progress, schedule, time)
types/                   # TypeScript type definitions
supabase/                # Schema and SQL files
reports/                 # Per-branch agent reports (DB.md, Auth.md, etc.)
```

## Environment Variables

Copy `.env.example` to `.env.local` for local configuration. All variables are optional in dev mode.

### Core Configuration

| Variable | Default | Required | Notes |
| --- | --- | --- | --- |
| `DATA_BACKEND` | `memory` | No | `memory` or `supabase`. Memory uses seeded data, resets on restart. |

### Supabase (if `DATA_BACKEND=supabase`)

| Variable | Required | Notes |
| --- | --- | --- |
| `SUPABASE_URL` | Yes | Your Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | No | Public anon key (if needed client-side) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | **Server-only**. Bypasses RLS. Never expose to client. |

### AI Moderation (optional)

| Variable | Default | Notes |
| --- | --- | --- |
| `ENABLE_AI_MODERATOR` | `false` | Can also be set in `config/features.ts` |
| `AI_API_KEY` | — | API key for OpenAI-compatible provider |
| `AI_BASE_URL` | `https://openrouter.ai/api/v1` | Base URL for provider (works with OpenAI, OpenRouter, etc.) |
| `AI_MODEL` | `openrouter/free` | Model to use |

### Zoom Integration (optional)

| Variable | Required | Notes |
| --- | --- | --- |
| `ENABLE_ZOOM_API` | No (default `false`) | Can also be set in `config/features.ts` |
| `ZOOM_ACCOUNT_ID` | Yes if enabled | Server-to-Server OAuth credentials |
| `ZOOM_CLIENT_ID` | Yes if enabled | Server-to-Server OAuth credentials |
| `ZOOM_CLIENT_SECRET` | Yes if enabled | **Server-only**. Server-to-Server OAuth secret |

> **Security:** Never commit `.env.local`. All secrets must remain server-side only.

## Available Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start development server at `http://localhost:3000` |
| `pnpm build` | Create production build with type checking |
| `pnpm start` | Serve production build locally |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript compiler with no emit (`tsc --noEmit`) |

## Architecture & Rules

### Core Principles

- **Mutations only via server actions** - All data mutations must go through `lib/api/actions.ts`. Each action re-checks session and permissions (membership, moderator, audience).
- **Repository pattern** - `lib/database/repository.ts` is the *only* module that talks to the data store. Pages and actions never call `getStore()` or backends directly.
- **Server-only code** - `lib/ai/*` and `lib/zoom/*` must remain server-only. When flags are off, they return mocks with no external calls.
- **Reusable components** - Never create subject-specific variants (e.g., no `BiologyPointCard`). Use shared components from `components/ui/` with props.
- **Consistent vocabulary** - Use **Circle** (platform), **Chord** (subject community), **Point** (weekly study group). Never rename to group/subject/channel/room.
- **Single source of truth** - Age/audience filtering only in `lib/domain/audience.ts`. Moderation selection only in `lib/domain/moderation.ts`.
- **Auth seam** - `lib/api/session.ts` is the auth boundary. Keep its API stable. No auth logic in components.

### Data Layer

- **Store interface** - Defined in `lib/database/store.ts`. All backends must implement it.
- **Backends** - Memory (default) or Supabase. Switch via `DATA_BACKEND`.
- **Memory store** - Lives on `globalThis` to survive Next.js HMR in dev.
- **Repository** - Wraps store with typed helpers for each entity (users, chords, points, goals, messages, etc.).

## Next.js 16 Gotchas

These are critical for this codebase:

| Issue | Solution |
| --- | --- |
| `params` and `searchParams` are Promises | Use `const { id } = await params` and `const search = await searchParams` |
| Use generated page types | Use `PageProps<"/route">` and `LayoutProps<"/">`, don't hand-write them |
| Cache Components enabled | Routes reading `cookies()` or `searchParams` may need `export const instant = false` or be wrapped in `<Suspense>` |
| `"use server"` modules | Can only export async functions. Exporting constants/types breaks the build |
| Server → Client boundary | Cannot pass plain functions from Server Components to Client Components. Pass serializable data or server action references |
| Forms | Client components rendering `<form action={...}>` need `"use client"`. Use `SubmitButton`/`useFormStatus`. Never nest `<form>` elements. |
| Date.now() in render | ESLint rule `react-hooks/purity` rejects it. Server Components re-render per request may need local disables (see `GoalCard`, `DeadlineCard`). |
| Root layout reads cookies | May affect caching behavior - follow existing patterns |
| Production errors | `next start` can return HTTP 200 with `<html id="__next_error__">`. Always grep response body for expected content, don't rely on status alone. |

## Feature Flags & Integrations

### Feature Flags

Configured in `config/features.ts`:

```ts
export const FEATURES = {
  ENABLE_AI_MODERATOR: false,
  ENABLE_ZOOM_API: false,
};
```

**Both must remain `false` by default.** The app is fully functional in this state.

### AI Moderation

When enabled, the AI assistant can:
- Summarize meeting transcripts/notes and suggest next-week goals
- Perform batched risk analysis across a point to identify students needing support
- Generate short motivational messages on demand

**Important:** AI only *proposes*. All decisions must be recorded by humans via existing server actions. All AI functions have mock fallbacks in `lib/ai/mock.ts`.

### Zoom Integration

When enabled:
- `createPoint` creates real Zoom meetings via Server-to-Server OAuth
- Tokens are cached in-memory on the server
- `getMeetingTranscript` fetches cloud recordings (requires cloud recording + audio transcription enabled)

When disabled:
- Meetings use the in-app **Demo Meeting Room** at `/points/[id]/meeting`
- All Zoom functions return mock data with no external calls

## Database

### Memory Backend (Default)
- Data seeded from `lib/database/seed.ts`
- Resets on server restart
- Stored on `globalThis` to survive dev HMR
- Ideal for development and demos

### Supabase Backend
1. Create a Supabase project
2. Run `supabase/schema.sql` in the SQL editor (creates tables, no seed data)
3. Set environment variables:
   ```env
   DATA_BACKEND=supabase
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
4. Create your first account via `/login` (no automatic seeding)

**Schema:** Each table uses `(id text primary key, data jsonb)` - the entire entity is stored as JSON matching `types/index.ts`. The service role key bypasses RLS and is **server-only**.

## Authentication

### Memory Backend (Default)
- Uses a plain cookie `sc_user` containing the user ID
- Demo accounts available on `/login` (no password)
- **Not production secure** - unsigned cookie

### Supabase Backend
- Uses Supabase Auth with email/password
- Session managed via `@supabase/ssr` with secure cookies
- Sign up and sign in flows available on `/login`

> **Note:** The current auth implementation is demo-appropriate. Replace with proper auth before exposing publicly.

## Branching, Merging & Agent Workflow

### Branch Structure
Parallel development uses these branches: `DB`, `Auth`, `Zoom`, `AI`, `Frontend`. All merge into `main`.

### Merge Order
**DB → Auth → Zoom → AI → Frontend**

### Ownership Rules (see `SKILL.md`)
| Branch | Owns | Hotspots (minimal diffs only) |
| --- | --- | --- |
| `DB` | `lib/database/*`, `supabase/schema.sql` | `types/index.ts`, README database section |
| `Auth` | `lib/api/session.ts`, `app/login/*` | `lib/api/actions.ts` (auth-related), `types/index.ts` |
| `Zoom` | `lib/zoom/*` | `lib/api/actions.ts` (createPoint, endPointMeeting), meeting page, `config/features.ts` |
| `AI` | `lib/ai/*` | `lib/api/actions.ts` (runMeetingAssistant), assistant UI, `config/features.ts` |
| `Frontend` | `app/`, `components/`, `hooks/`, `app/globals.css`, `public/` | `lib/api/actions.ts`, `types/index.ts`, `config/*` (only if necessary) |

### Agent Workflow
1. Read `AGENT_REPORTING.md`, `SKILL.md`, `AGENTS.md`, and relevant `README.md` sections
2. Follow the reporting contract - lead with "What you need to do", update `reports/<branch>.md`
3. Plan first per `SKILL.md`'s planning deliverable, wait for approval
4. Verify with `pnpm lint && pnpm build` before pushing
5. Push frequently, open draft PR to `main` (never merge directly)
6. Coordinator merges in order

## Verification & Testing

### Pre-Push Checklist
- [ ] `pnpm lint` passes (warnings are okay if pre-existing)
- [ ] `pnpm build` passes (includes typecheck)
- [ ] Manual click-through works with both flags off: `/` → chord → point → meeting room
- [ ] No secrets committed
- [ ] No feature flags set to `true`
- [ ] Only touched files in scope or declared hotspots

### Manual Testing
1. Start dev server: `pnpm dev`
2. Visit homepage, navigate to a chord
3. Join a point or view existing point
4. Check meeting room loads
5. Test authentication flows
6. Test moderator features if applicable

### Production Validation
When testing production builds, **always check the response body** - Next.js can return HTTP 200 with an error page (`<html id="__next_error__">`). Use `curl` or browser dev tools to inspect actual content.

## Deployment (Vercel)

### Current Deployment
- **Production URL:** [https://studycircle-kappa.vercel.app/](https://studycircle-kappa.vercel.app/)
- **Project:** `studycircle` (team `soosohs-projects`)
- **Auto-deploy:** Connected to GitHub - pushes to `main` trigger production deployments

### Manual Deployment

```bash
# Link to Vercel (first time)
pnpm dlx vercel link

# Deploy to production
pnpm dlx vercel --prod
```

### Environment Variables on Vercel
Configure in **Vercel Dashboard → Project → Settings → Environment Variables**. 
- Mark secrets as "Sensitive" / not exposed to browser
- Server-only vars (service role keys, API secrets) should only be available to Server Functions
- No `NEXT_PUBLIC_*` variables are currently needed

### Build Configuration
- **Framework:** Next.js
- **Build Command:** `next build` (default)
- **Install Command:** `pnpm install` (auto-detected)
- **Node Version:** 22.x
- **Package Manager:** pnpm 12.8.1

## CI (GitHub Actions)

Since Vercel handles deployments automatically, CI is optional but recommended for catching issues early.

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 12.8.1

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Type check
        run: pnpm typecheck

      - name: Build
        run: pnpm build
```

## Troubleshooting

| Issue | Cause | Solution |
| --- | --- | --- |
| Type errors after interface changes | Implementations don't match updated interface | Update all implementations (memory-store, supabase-store) |
| `"use server"` module errors | Exporting non-async or non-function exports | Only export async functions from `"use server"` modules |
| Can't pass functions to client components | Next.js serialization boundary | Pass serializable data or server action references |
| Cookie/searchParams caching issues | Cache Components behavior | Follow AGENTS.md - may need `instant=false` or `<Suspense>` |
| Production shows error page but 200 status | Render error in production | Check response body for `__next_error__` |
| Date.now() lint errors | `react-hooks/purity` rule | Already handled in Server Components with local disables where needed |
| Build fails on Vercel | Missing env vars or type errors | Check build logs, ensure all env vars configured, run `pnpm build` locally |
| Module not found errors | Missing dependencies | Run `pnpm install` |

## Additional Resources

- [AGENTS.md](./AGENTS.md) - Verified commands, Next.js 16 specifics, gotchas
- [SKILL.md](./SKILL.md) - Working agreement, branch ownership, merge order, MCP usage
- [AGENT_REPORTING.md](./AGENT_REPORTING.md) - Agent reporting contract
- [README.md](./README.md) - User-facing documentation
- [Supabase Schema](./supabase/schema.sql) - Database schema
- [Vercel Project](https://vercel.com/soosohs-projects/studycircle) - Deployment dashboard
- [GitHub Repo](https://github.com/soosoh/OpenCircle) - Source code
