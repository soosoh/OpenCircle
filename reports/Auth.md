# Auth branch report

<!-- Updated in place after every push. See AGENT_REPORTING.md. -->

### What you need to do

**Now**

- [ ] ⚠️ **Rotate your OpenRouter key** (it was pasted into the chat): https://openrouter.ai/settings/keys → delete the exposed key → create a new one → paste its value at `AI_API_KEY=` in `.env.local` (repo root). Verify: the old key shows "Revoked".
- [ ] **Finish `.env.local`**: set `DATA_BACKEND=supabase` (currently `memory`) and uncomment + fill `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` with values from **Project Settings → API keys**. Verify: `pnpm dev` → `http://localhost:3000/login` shows **Sign in / Create account** tabs instead of demo cards.

**Before merge**

- [ ] **Live auth click-through** (after the two Now items; requires my redirect fix, pushed in `89b4a24`, present in your running tree): open `http://localhost:3000/login` → create an account → land on `/dashboard` → sign out at `/profile` → sign back in with the same email/password; wrong password must show an inline error, and no `ERR_TOO_MANY_REDIRECTS`. Verify: user row under **Authentication → Users** and profile renders.

**Already done by you** ✅ Supabase project created · `supabase/schema.sql` run ("Success. No rows returned" is normal DDL output) · **Confirm email** off.

**Optional / later**

- [ ] Supabase **Authentication → Settings** → raise JWT expiry above the 1 h default (server-only auth does not auto-refresh mid-session). Verify: a signed-in tab stays signed in past 1 h.
- [ ] **Draft PR** `Auth` → `main` — no GitHub MCP/`gh` in this session: either the main/coordinator agent opens it, or install GitHub CLI (`winget install GitHub.cli` + `gh auth login`) and I open it. Manual: https://github.com/soosoh/OpenCircle/pull/new/Auth — mark **Draft**; never merge (coordinator's job, order DB → Auth → Zoom → AI).

### Decisions I need from you

- **Who opens the draft PR?** (A) Main agent opens it — recommended if it has GitHub tooling; (B) you install `gh` and I open/update it; (C) you open manually from the link. Tradeoff: only A/B let me keep it updated automatically.
- **Shared worktree safety.** The checkout has been flipped out from under agents four times (my commit once landed on `DB`). Options: (A) one clone/worktree per agent — recommended; (B) keep sharing and I isolate in temp worktrees — works but slower. **Recommendation: A.**

### Status

- Branch: `Auth`
- Latest commit: `89b4a24` (pushed — redirect-loop fix; before it: `5bf9491`/`75078dd`/`0d1219d` report syncs, `b783e77` main merge, `371bb6b` auth code). The trivial report-sync commit that records this line follows each push (a file cannot contain its own commit sha).
- Draft PR: `none` (no GitHub MCP or `gh` in this session; link above)
- Blocked on: **nothing of mine** — your two Now items gate the Supabase live round-trip.
- Verification: `pnpm lint` ✅ · `pnpm build` (incl. TypeScript) ✅ on `89b4a24`. Click-through, both flags off, memory backend, port 3100: `/login` sign-in demo → `/dashboard` → `/chords/biology` → `/points/ap-bio-genetics` → **Demo Meeting Room** ✅. Redirect-loop repro matrix ✅ — ghost/stale `sc_user` cookie: `/login` renders (200, was an infinite 307 loop = the reported `ERR_TOO_MANY_REDIRECTS`), `/dashboard` 307s once to `/login` and stops; valid `sc_user=maya`: `/login` 307 → `/dashboard` 200; anon `/dashboard` 307 ✅.
- Root cause of your `ERR_TOO_MANY_REDIRECTS`: `/login` bounced on raw session-cookie presence while `/dashboard` requires a profile row; whenever they disagreed (stale cookie after an in-memory store reset, or an auth user without a profile) the two pages ping-ponged. Fix: `/login` now gates on `getCurrentUser()` (profile must resolve) — `app/login/page.tsx`, API shape of `lib/api/session.ts` unchanged.
- Foreign changes **not mine, untouched**: shared tree currently on `AI` branch with other agents' `app/dashboard`, `components/assistant`, `lib/ai/*`, `lib/api/actions.ts` WIP + untracked `devlog*.txt`, `err.txt`, `out.txt`, `reports/DB.md`, `reports/Frontend.md`.
