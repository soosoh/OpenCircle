# Developer Guide — OpenCircle

This guide is for contributors working on the codebase. For user-facing docs, see [`README.md`](./README.md).

## Quick Start for Devs

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Runs with in-memory store and all feature flags off by default.

## Verified Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Dev server (:3000) |
| `pnpm build` | Production build + typecheck |
| `pnpm start` | Run production build locally |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |

**Always verify:** `pnpm lint && pnpm build` before pushing. Manually click through `/` → chord → point → meeting room.

## Branches & Merge Order

Parallel work uses branches: `DB`, `Auth`, `Zoom`, `AI`, `Frontend`. Merge in order **DB → Auth → Zoom → AI → Frontend**. See `SKILL.md` for ownership, hotspots, and rules.

## Environment Variables

Copy `.env.example` to `.env.local`. All optional in dev (memory backend works with nothing set).

### Database
- `DATA_BACKEND` = `memory` (default) | `supabase`
- `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server-only if using Supabase)

### AI (optional)
- `ENABLE_AI_MODERATOR` (or `config/features.ts`) 
- `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL` (OpenAI-compatible; defaults to OpenRouter free)

### Zoom (optional)
- `ENABLE_ZOOM_API` (or `config/features.ts`)
- `ZOOM_ACCOUNT_ID`, `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET`

## Key Architecture Rules

- **Mutations:** Only via server actions in `lib/api/actions.ts`. Each action re-checks session + permissions.
- **Data access:** Only `lib/database/repository.ts` talks to store. Pages/actions never use `getStore()` directly.
- **Server-only:** `lib/ai/*`, `lib/zoom/*` must remain server-only.
- **Components:** Reusable only. No subject-specific variants. Add `"use client"` only when necessary.
- **Vocabulary:** Circle, Chord, Point (never rename).
- **Age filtering:** Only in `lib/domain/audience.ts`.
- **Moderation:** Only in `lib/domain/moderation.ts`. Each point has exactly one moderator.
- **Auth seam:** `lib/api/session.ts` — keep exports stable.
- **Flags off by default:** App must fully work with both flags false.

## Next.js 16 Gotchas

- `params` and `searchParams` are **Promises** — `const { id } = await params`
- Use `PageProps<"/route">` and `LayoutProps<"/">` (generated types)
- Cache Components enabled (`cacheComponents: true`). Routes reading `cookies()`/`searchParams` need care or `<Suspense>`
- `"use server"` modules only export async functions
- Can't pass plain functions from Server to Client components
- Root layout reads cookies → may set `instant=false` behavior
- See `AGENTS.md` for full details

## GitHub Actions CI (Suggested)

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
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 12.8.1
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm build
```

This runs on PRs and pushes to main. Vercel handles actual deployment separately.

## Vercel Setup

### Already deployed
- **Production:** https://studycircle-kappa.vercel.app/
- **Project:** `studycircle` (team `soosohs-projects`)
- Linked via `.vercel/`

### To set up from scratch
1. Install Vercel CLI: `pnpm dlx vercel`
2. Link: `pnpm dlx vercel link`
3. Set env vars: `pnpm dlx vercel env add ...` or in Vercel dashboard
4. Deploy: `pnpm dlx vercel --prod`

### Environment Variables on Vercel
Add in Project Settings → Environment Variables. Mark server-only secrets as not exposed to client. `NEXT_PUBLIC_*` only if truly needed (none required currently).

### Notes
- Vercel auto-deploys from GitHub when connected
- Build command: `next build` (default)
- Framework: Next.js
- Node version: 22.x (as configured)

## Contributing Workflow

1. Create/switch to your branch
2. Read `SKILL.md` and `AGENTS.md`
3. Follow ownership rules
4. Make changes, verify with `pnpm lint && pnpm build`
5. Update `reports/<branch>.md` per `AGENT_REPORTING.md`
6. Push and open/update draft PR to `main`
7. Coordinator merges in order

## Troubleshooting

- **Type errors after interface changes:** Check all implementations match interfaces
- **"use server" export error:** Only async functions in `"use server"` modules
- **Functions passed to client components:** Pass serializable data or server actions
- **Cookie/searchParams issues:** Check Cache Components rules in `AGENTS.md`
- **Production returns 200 but error page:** Check response body for `__next_error__` as per `AGENTS.md`
