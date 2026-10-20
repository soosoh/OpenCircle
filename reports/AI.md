# AI branch report

See AGENT_REPORTING.md. Branch: `AI`.

## What you need to do

- [ ] **Now:** nothing. The AI branch currently needs no human action to keep working.
- [ ] **Before merge:** decide the AI defaults (see decisions) so I do not merge a paid model by
      accident. Free `openrouter/free` is the committed default.
- [ ] **Optional / later:** if you want live model calls instead of mock responses, set
      `ENABLE_AI_MODERATOR: true` in `config/features.ts` and put your key in `.env.local` as
      `AI_API_KEY` (plus `AI_BASE_URL=https://openrouter.ai/api/v1`, `AI_MODEL=openrouter/free`).
      Verify by pressing "Summarize the meeting" on `/moderator` as `maya`; the badge reads
      "Live model" instead of "Mock response (AI off)". **Do not commit the flag as true.**

## Decisions I need from you

- Keep `AI_MODEL=openrouter/free` as the default? It can never spend credits, but picks whatever
  the free router serves. (Recommend: yes; a specific `:free` id like
  `deepseek/deepseek-chat-v3:free` is the alternative if you want a fixed model.)

## Status

- Branch: `AI`
- Latest commit: `979c434` (pushed to `origin/AI`) — contains `7f4d78a` (feature) + `979c434` (report)
- Synced: `origin/main` is still `09d3e78`; `AI` contains it (no rebase needed).
- Draft PR: not opened — **no `gh` CLI and no GitHub MCP available in this environment**.
  Open one manually from `origin/AI` → `main`, or re-run with a GitHub tool.
- Blocked on: nothing (PR creation needs a human or a GitHub tool)
- PR readiness: **Ready** — scope, lint/build, flag-off click-through, and safety all verified.

## What landed

- `lib/ai/openai.ts` — provider-agnostic Chat Completions client (`AI_BASE_URL` / `AI_API_KEY` /
  `AI_MODEL`, with `OPENAI_*` fallbacks). Adds batched `analyzePointStudents`, defensive JSON
  parsing, timeout and rate-limit error messages. Returns mock data whenever the flag is off.
- `lib/ai/mock.ts` — `StudentRisk` / `StudentInput` / `mockPointStudents` for the batched path.
- `lib/api/actions.ts` — `runMeetingAssistant` no longer errors when the flag is off; it accepts
  pasted notes or the Zoom transcript. New `analyzePointStudents` (one call per point,
  moderator-gated) and `getMotivation` (on demand, from the viewer's own points and goals).
- `components/assistant/` — `AssistantPanel`, `RiskPanel`, `MotivationCard` (client, on-demand
  buttons; AI only proposes, the moderator still records goals via `createGoal`).
- Wired into `ModeratorPanel` (per-point assistant slot, under the point header) and `/dashboard`
  (motivation card).
- Docs: `.env.example` now tracked (`!.env.example` in `.gitignore`) and documents the `AI_*` vars
  and OpenRouter; README "Enabling AI moderation" / "Connecting an AI provider" rewritten.

## Verified

- `pnpm typecheck`, `pnpm lint`, `pnpm build` — all green (ran again on `979c434`).
- Flag-off click-through on dev (`:3000`) as `maya`: `/` → `/chords/biology` →
  `/points/ap-bio-genetics` → `/points/ap-bio-genetics/meeting` all 200 with expected content
  and no `__next_error__`. `/moderator` shows the assistant + risk panels (mock badge);
  `/dashboard` shows the motivation card.
- MCP: **none available** (no GitHub/Playwright/Context7/Supabase MCP, no `gh`). Verified with
  `git`, `Invoke-WebRequest` against the dev server, and repo files.
- Safety: `config/features.ts` committed with both flags `false`; `.env.local` untracked; the
  only `sk-...`/`your-key` strings in the diff are doc placeholders, no real secrets.
- Hotspot touched: `lib/api/actions.ts` (allowed for AI). No other branch's files edited.
- Repeatedly re-checked the branch before each commit; the shared tree was on `DB` twice, so the
  switch back to `AI` is part of the routine.

## Not verified

- Live model path (flag `true` + real key) was **not** exercised end-to-end; it would spend a
  request. Code-reviewed only. Human can run it per the optional step above.
