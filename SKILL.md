---
name: OpenCircle
description: Working agreement for agents building OpenCircle — architecture invariants,
  branch ownership (AI, DB, Zoom, Auth), planning rules, verification. Read before
  planning or writing any code.
---

# OpenCircle

Playbook for every agent working in this repo. Read this **and** `AGENTS.md` (verified
commands + Next.js 16 specifics) before you plan. This file adds the cross-branch
working agreement; AGENTS.md stays the source of truth for Next 16 gotchas.

## Non-negotiables

- Vocabulary: **Circle** (platform) / **Chord** (subject) / **Point** (weekly group).
  Never rename to group/subject/channel/room.
- All mutations go through server actions in `lib/api/actions.ts`; each re-checks
  session + permission (membership, moderator, audience).
- `lib/database/repository.ts` is the only data-access module. Pages and actions never
  call `getStore()` or a backend directly.
- `lib/ai/*` and `lib/zoom/*` are server-only. With their flag off they return mock
  data, read no env vars, and make no network calls. Flags in `config/features.ts`
  stay `false` by default.
- Reusable components only (no `BiologyPointCard`). Age filtering lives only in
  `lib/domain/audience.ts`.
- `"use server"` modules export async functions only. Never pass plain functions from a
  Server Component to a Client Component.
- Verify every change: `pnpm lint && pnpm build`, then click-through
  `/` → chord → point → meeting room.

## Parallel branches: ownership

| Branch | Owns (only this branch edits) | Hotspots (keep diffs minimal, announce in plan) |
| --- | --- | --- |
| DB | `lib/database/*`, `supabase/schema.sql` | `types/index.ts`, README database section |
| Auth | `lib/api/session.ts`, `app/login/*` | `lib/api/actions.ts` (sign-in/out, `requireUser` call sites), `types/index.ts` |
| Zoom | `lib/zoom/*` | `lib/api/actions.ts` (`createPoint`, `endPointMeeting`), `app/points/[pointId]/meeting/*`, `config/features.ts` |
| AI | `lib/ai/*` | `lib/api/actions.ts` (`runMeetingAssistant`), assistant UI, `config/features.ts` |

When you must edit a shared file, make the smallest possible diff and list it in your
plan (file + function) so the merge can be sequenced.

## Merge order

**DB → Auth → Zoom → AI.** Data layer, then identity, then meeting plumbing, then AI
on top of transcripts. Expect real conflicts only in `lib/api/actions.ts` and
`config/features.ts`.

## Branch notes

### DB
- The working tree on Main added `upsert` to the `DataStore` interface
  (`lib/database/store.ts`) with **no implementations** — typecheck is currently red.
  Finish it (both stores) or revert it before anything else. Memory-store: mirror
  `insert`'s structuredClone semantics. Supabase-store: one atomic
  `.upsert({ id, data: withoutId(row) })` call.
- Memory store seeds via its constructor (`client.ts` → `createMemoryStore(buildSeed())`),
  not through insert/upsert. Supabase starts empty (schema.sql has no seed rows). Any
  Supabase seeding must be idempotent and go through the repository.
- `supabase-store` update is read-modify-write, not atomic — flag it in any plan that
  touches concurrent writes.

### Auth
- `session.ts` is the seam. Its exports (`getSessionUserId`, `getCurrentUser`,
  `requireUser`, `setSessionUser`, `clearSession`) are used across `actions.ts` and
  pages — keep the API shape or list every call site you change.
- The `sc_user` cookie is an unsigned id. Any replacement must keep `/login` demo
  accounts working (or ship a migration) and stay server-only. No auth logic in
  components.

### Zoom
- All Zoom calls live in `lib/zoom/zoom.ts` behind `ENABLE_ZOOM_API`. Flag off =
  mock data, `demo://` URL, in-app meeting room.
- `createPoint` creates the meeting; `endPointMeeting` ends it. `getMeetingTranscript`
  returns `""` when no transcript exists — the AI branch consumes this contract;
  don't change the signature without announcing it.
- The token cache is module-level and server-only.

### AI
- Every AI function has a mock twin in `lib/ai/mock.ts` and returns it when the flag is
  off. **New AI features need mock parity.**
- `runMeetingAssistant` takes a pasted transcript today; Zoom owns the transcript
  pipeline — integrate, don't duplicate.
- AI only proposes (summaries, goals, risk flags); humans record via existing actions.
  Parse JSON defensively; surface failures in the action's return state.

## MCP usage

- Discover first: list the MCP tools your harness exposes before using any. Never
  invent tool names or claim to have used a tool you do not have. If none exist, say
  so and continue with CLI/repo tools.
- Preferred servers when available: GitHub (branches/PRs), Playwright (browser
  click-through), Context7 (current docs), Supabase (DB/Auth only).
- Fallbacks: `git`/`gh`, manual browser or curl, repo files and
  `node_modules/next/dist/docs/`. Report a missing server; never block on it.
- Safety: never pass `.env.local` contents or secrets (service-role key, Zoom client
  secret, OpenAI key) to an MCP server. Keep feature flags false.
- Each agent opens a draft PR to main via GitHub MCP (or `gh`) and keeps it updated;
  the coordinator merges DB → Auth → Zoom → AI. Agents never merge.

## Planning deliverable (output before implementing)

1. Files to create/modify (full paths) and why.
2. Sketched diffs for any hotspot file.
3. Flag-off behavior for everything new (what the mock returns).
4. Verification steps: lint, build, click-through path, which flag states you tested.
5. Open questions / assumptions.

## Verification matrix

- Both flags off: full click-through must pass — this is the default demo path.
- Your flag on: exercise your code path via direct function calls or a temporary local
  flip. Never commit the flag as `true`.
- Never commit `.env.local` or real keys.

## Coordinator (merge agent)

Replay branches in order DB → Auth → Zoom → AI. After each merge run the verification
matrix before taking the next branch. When a branch's plan promised a hotspot edit,
verify the merged code still honors that branch's contract (e.g. Zoom's transcript
signature, Auth's session API).
