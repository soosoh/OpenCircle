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
- Latest commit: `7f4d78a` (pushed to `origin/AI`)
- Draft PR: none
- Blocked on: nothing

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

- `pnpm typecheck`, `pnpm lint`, `pnpm build` — all green.
- Flag-off click-through on dev (`:3000`): `/` renders, `/moderator` as `maya` shows the assistant
  and risk panels (mock badge), `/dashboard` shows the motivation card. No `__next_error__`.
- Repeatedly re-checked the branch before each commit; the shared tree was on `DB` twice, so the
  switch back to `AI` is part of the routine.
