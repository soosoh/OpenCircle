# Auth branch report

<!-- Updated in place after every push. See AGENT_REPORTING.md. -->

### What you need to do

**Now**

- [ ] **Finish `.env.local`** (repo root) — the copy I inspected shows the auth switch is still off and one key is missing:
  - `DATA_BACKEND=memory` → change to `DATA_BACKEND=supabase` (while other agents test in the shared tree, keep in mind they share this file — flip it only when you're the one testing auth).
  - Add `SUPABASE_PUBLISHABLE_KEY=<anon/publishable key>` — **not present**; get it from Supabase **Project Settings → API keys** (distinct from the service_role key you already set; never commit either).
  - Verify: `pnpm dev` → `http://localhost:3000/login` shows **Sign in / Create account** tabs, not demo cards.
- [ ] ⚠️ **Rotate your OpenRouter key** — `AI_API_KEY` is still set to what looks like the key you pasted in chat (len 73). https://openrouter.ai/settings/keys → delete + recreate → paste the new value. Verify: old key shows "Revoked". (Credit limit noted: the Auth branch makes **zero** AI calls, both flags stay `false`; free-model policy belongs to the AI branch.)
- [ ] ⚠️ **`VERCEL_OIDC_TOKEN` is sitting in `.env.local`** (len ~1264) — I have not touched or read it; it is gitignored so it is safe locally, but don't paste it into chats or commit it anywhere, and delete it if you don't recognize why it's there.

**Before merge**

- [ ] **Live auth click-through** (blocked by the Now env item; I could not run it because `DATA_BACKEND` is still `memory`): open `http://localhost:3000/login` → create an account → land on `/dashboard` → sign out at `/profile` → sign back in with the same email/password; wrong password shows an inline error and no cookie; no `ERR_TOO_MANY_REDIRECTS`. Verify: user row under Supabase **Authentication → Users**.

**Already done** ✅ Supabase project created · schema run · **Confirm email** off · redirect-loop fix pushed (`89b4a24`) · Next 16 prerender fix pushed (`154c3b6`).

**Optional / later**

- [ ] Supabase **Authentication → Settings** → raise JWT expiry above the 1 h default. Verify: a signed-in tab stays signed in past 1 h.
- [ ] **Draft PR** `Auth` → `main` — hand the "PR prompt" from my latest chat reply to the main agent (it opens the draft PR); or install GitHub CLI (`winget install GitHub.cli` + `gh auth login`) and I open it. Manual: https://github.com/soosoh/OpenCircle/pull/new/Auth — **Draft**, never merge (coordinator merges, order DB → Auth → Zoom → AI).

### Decisions I need from you

- **Who opens the draft PR?** (A) Main agent with the PR prompt — recommended; (B) you install `gh` and I open it; (C) you open manually. Only A/B let me keep it updated.
- **Shared worktree safety.** Flipped four times (my commit once landed on `DB`); your `.env.local` is also shared across agents' dev servers. (A) one clone/worktree per agent — recommended; (B) keep sharing and I isolate in temp worktrees. **Recommendation: A.**

### Status

- Branch: `Auth`
- Latest commit: `154c3b6` (pushed — Next 16 prerender fix; before it: `ebb741d`/`ec3446e` reports, `89b4a24` redirect-loop fix, `5bf9491`/`75078dd`/`0d1219d` reports, `b783e77` main merge, `371bb6b` auth code). The trivial report-sync commit that records this line follows each push (a file cannot contain its own commit sha).
- Draft PR: `none` (no GitHub MCP or `gh` in this session; PR prompt + manual link above)
- Blocked on: **your env flip** (`DATA_BACKEND=supabase` + `SUPABASE_PUBLISHABLE_KEY`) for the Supabase live round-trip; nothing else.
- Verification: `pnpm lint` ✅ · `pnpm build` (incl. TypeScript) ✅ on `154c3b6`. Memory-mode click-through, both flags off: `/login` sign-in → `/dashboard` → `/chords/biology` → `/points/ap-bio-genetics` → **Demo Meeting Room** ✅. Redirect repro matrix ✅ (ghost cookie `/login` 200 instead of loop; valid cookie bounces to `/dashboard`). Dev log after fix: **no `unstable value` errors** on `/dashboard`, `/chords/[chordId]`, `/points/[pointId]` ✅.
- **The `/dashboard` prerender crash you hit** (blocking overlay, `new Date()` at `lib/domain/time.ts:83` via `app/dashboard/page.tsx:40`): pre-existing main-code issue — Next 16 Cache Components rejects unstable `new Date()` during prerender passes even with the layout's `instant = false`. Fixed on `Auth` per Next docs: `await connection()` at the top of the three pages doing schedule math (`app/dashboard/page.tsx:6`, `app/chords/[chordId]/page.tsx:27`, `app/points/[pointId]/page.tsx:32`). Your running shared-tree server will keep showing the overlay until `Auth` is merged and you pull, or you run from a checkout that includes `154c3b6`.
- Remaining non-blocking Cache-Components *insights* in the dev log (not errors, pre-existing, left for the coordinator): `/` and `/points/[pointId]/meeting` read URL data outside `<Suspense>`; dashboard/chord/point pages log "uncached data" notes. Proper resolution is the Suspense/`use cache` migration, out of Auth scope.
- Foreign changes **not mine, untouched**: shared tree on other agents' branches with their WIP (`lib/api/actions.ts` non-Accounts sections, `lib/ai/*`, `components/assistant/`, `app/dashboard` history) + untracked `devlog*.txt`, `err.txt`, `out.txt`, `reports/DB.md`, `reports/Frontend.md`.
