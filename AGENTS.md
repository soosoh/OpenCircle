# AGENTS.md

## Verified commands (pnpm, Next 16 + React 19 + Tailwind 4)
- `pnpm dev` (:3000), `pnpm build` (also typechecks), `pnpm start`, `pnpm lint`, `pnpm typecheck`.
- No test suite exists. Verify changes with `pnpm lint && pnpm build` plus a click-through: `/` → chord → point → meeting room.
- Check work in dev against `http://localhost:3000`, not `pnpm start`. Production `next start` returns **HTTP 200 with an error page** (`<html id="__next_error__">`) when a render throws, so status codes alone do not prove a page works. Grep the response body for expected content.

## Next 16 specifics that will bite you
- Cache Components is **on** (`cacheComponents: true` in `next.config.ts`). Every route reads the session cookie in `app/layout.tsx`, which sets `export const instant = false` there so routes may block on the server. If you add a route that reads `cookies()`/`searchParams`, keep that opt-out or wrap the access in `<Suspense>`.
- `params` and `searchParams` are **Promises**: `const { id } = await params`.
- Root layout props use the generated `LayoutProps<"/">`; pages use `PageProps<"/route">`. Do not hand-write these types.
- The template's `next/font/google` was removed on purpose: font fetching needs network at build time.

## Gotchas found the hard way
- `"use server"` modules may only export async functions. Exporting a constant or type from `lib/api/actions.ts` breaks the build.
- **A Server Component cannot pass a plain function to a Client Component.** Pass serializable data or a bound server action instead (this is why `StudyCircle` takes `items: {chord, href}[]`).
- Client components that render `<form action={…}>` need `"use client"`; use `SubmitButton`/`useFormStatus` for pending state. Do not nest `<form>` elements — pass extra values via `MessageInput`'s `hiddenFields`.
- Tailwind 4: theme tokens are declared with `@theme` in `app/globals.css` (`bg-paper`, `text-ink`, `text-muted`, `border-line`, `bg-brand`, `text-mint`, `bg-sun`, `bg-coral`, `bg-surface`). No `tailwind.config.js`.
- The ESLint rule `react-hooks/purity` rejects `Date.now()` during render. `GoalCard` and `DeadlineCard` disable it locally on purpose: they are Server Components re-rendered per request.

## Vocabulary (non-negotiable)
- **Circle** = the whole platform (homepage). **Chord** = a subject community. **Point** = a weekly study group inside a chord.
- Never rename these to "group", "subject", "channel", or "room".

## Architecture rules
- All mutations go through server actions in `lib/api/actions.ts`. Each re-checks session and permission (membership, moderator, audience). Do not call the repository directly from a page or component.
- `lib/database/repository.ts` is the **only** module that talks to the data store. Pages and actions import from there.
- Two backends behind one `DataStore` interface: in-memory (default, seeded, saved to `.data/studycircle.json` so it survives restarts; `lib/database/persist.ts`, skipped on Vercel) and Supabase (`DATA_BACKEND=supabase`). The in-memory store lives on `globalThis` to survive dev HMR.
- Age filtering has exactly one implementation, `lib/domain/audience.ts`. Chords, points, member search, and join checks all use it. College groups require 18+.
- Every point has exactly one moderator, chosen by `lib/domain/moderation.ts` from subject familiarity, experience, group success, and reputation.
- Points store a `WeeklySchedule` (weekday + time + timezone) rather than a fixed date, so recurring meetings can be added later without a migration.
- `lib/ai/*` and `lib/zoom/*` are server-only. They must keep working with no API keys: each returns mock data when its flag in `config/features.ts` is off.
- Auth is backend-aware (`lib/api/session.ts` is the seam, exports unchanged): `DATA_BACKEND=supabase` uses Supabase Auth (email + password, signed JWT cookies via `@supabase/ssr`); `DATA_BACKEND=memory` uses the demo session (`sc_user` cookie + shared `DEMO_PASSWORD`). Keep every auth rule server-only — no auth logic in components.

## Features are off by default
- `config/features.ts`: `ENABLE_AI_MODERATOR` is true only when `AI_API_KEY` (or `OPENAI_API_KEY`) is set and `ENABLE_AI_MODERATOR` env is not "false"; `ENABLE_ZOOM_API` is false. The app must fully work with both off and make no external calls. Leave Zoom off unless explicitly asked.

## Adding things
- New chord: append to `CHORD_CATALOG` in `config/chords.ts` and restart so the seed re-runs.
- New point: no code needed; users create them from a chord page.
- New component: put it in the matching `components/*` folder, accept data as props, reuse `Card`/`Button`/`Badge`/`Avatar`/`ProgressBar`, and **never** make subject-specific variants (`BiologyPointCard` is wrong).
- Demo data lives in `lib/database/seed.ts` and doubles as the fixture set.

## Docs
- `README.md` covers enabling AI moderation, connecting OpenAI and Zoom, the Supabase schema, creating chords and points, and extending components.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
