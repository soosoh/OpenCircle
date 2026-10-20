# Auth branch report

<!-- Updated in place after every push. See AGENT_REPORTING.md. -->

### What you need to do

**Now** (nothing dies without these — the app runs with zero config; these enable *real* Supabase auth)

- [ ] **Create a free Supabase project** — https://supabase.com/dashboard → **New project**. Verify: project dashboard opens and **Project Settings → API keys** shows a Project URL, an anon/publishable key, and a service_role key. (Free tier; projects pause after 1 week idle.)
- [ ] **Paste credentials into `.env.local`** at the repo root (create it from `.env.example` if absent): set `DATA_BACKEND=supabase`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — values from the dashboard above, never commit or share them. Verify: `pnpm dev` starts without "requires SUPABASE_*" errors.

**Before merge**

- [ ] **Run schema** — Supabase **SQL Editor** → paste `supabase/schema.sql` → **Run**. Verify: Table Editor lists `users`, `chords`, `points`, `goals`, `messages`, `help_requests`, `private_messages`. ⚠️ *Reversible: drop these 7 tables to undo; run only on the fresh project.*
- [ ] **Disable email confirmation** — Supabase **Authentication → Providers → Email** → turn **Confirm email** off. Verify: toggle is off. (Sign-up uses `email_confirm: true` via service role, so this is belt-and-suspenders.)
- [ ] **Optional / stronger sessions** — Supabase **Authentication → Settings** → raise JWT expiry above the 1 h default (server-only auth does not auto-refresh mid-session). Verify: a signed-in tab stays signed in past 1 h.
- [ ] **Live auth click-through** — with `DATA_BACKEND=supabase`, open `http://localhost:3000/login`: create an account → land on `/dashboard` → sign out at `/profile` → sign back in with the same email/password; wrong password must show an inline error. Verify: user row under **Authentication → Users** and profile renders.

**Optional / later**

- [ ] **Open a draft PR** `Auth` → `main` (no GitHub MCP/`gh` CLI in this session): https://github.com/soosoh/OpenCircle/pull/new/Auth — mark **Draft**; the coordinator merges.

### Decisions I need from you

- **Live-test Supabase auth now vs. merge on memory-mode verification alone?** (A) Do the 3 setup items above and I run the Supabase round-trip before merge — recommended, it's the whole point of this branch; (B) merge on memory-mode verification alone — faster, but the Supabase path ships unexercised. **Recommendation: A.**
- **Shared worktree safety.** The checkout has been flipped out from under agents three times (my commit once landed on `DB`). Options: (A) one clone/worktree per agent — recommended, eliminates cross-contamination; (B) keep sharing and I continue isolating in temp worktrees — works but slower. **Recommendation: A.**
- **`gh` CLI unavailable here.** (A) You install GitHub CLI (`winget install GitHub.cli`, then `gh auth login`) and I open/update the draft PR myself — recommended; (B) you open it manually from the link. **Recommendation: A.**

### Status

- Branch: `Auth`
- Latest commit: `0d1219d` (pushed — this report, on top of merge `b783e77` and auth code `371bb6b`); the trivial report-sync commit that records this line follows each push (a file cannot contain its own commit sha)
- Draft PR: `none` (no GitHub MCP or `gh` in this session; manual link above)
- Blocked on: **nothing** for memory-mode verification; Supabase live round-trip waits on the three "Now"/schema items.
- Verification: `pnpm lint` ✅ · `pnpm typecheck` ✅ · `pnpm build` ✅ on `371bb6b` (clean isolated worktree; `b783e77` adds markdown only). Click-through with both feature flags off, memory backend: `/` → `/login` (demo picker + `demo1234`) → sign-in action 303 + `sc_user` → `/dashboard` → `/chords/biology` → `/points/ap-bio-genetics` → **Demo Meeting Room** ✅ · anon `/profile` → 307 `/login` ✅ · wrong demo password → no cookie ✅ · sign-up → new account + session ✅.
- Foreign changes **not mine, untouched**: shared-tree `lib/database/*` upsert WIP (DB agent) + untracked `devlog.txt`, `reports/Frontend.md`.
