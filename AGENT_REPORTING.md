# Agent reporting contract

Every agent (branches: DB, Auth, Zoom, AI) must keep the human unblocked. That means
leading with a "What you need to do" report and persisting it to `reports/<branch>.md`.

## The report

Start every response with this section. If nothing is needed, say so in one line.

### What you need to do
- [ ] **Now:** <blocker action> — exact place, exact step, how to confirm it worked.
- [ ] **Before merge:** <action>
- [ ] **Optional / later:** <action>

### Decisions I need from you
- <question> (options, tradeoff, my recommendation)

### Status
- Branch: `<branch>`
- Latest commit: `<sha>` (pushed / not pushed)
- Draft PR: `<link or "none">`
- Blocked on: <human action or "nothing">

## Rules

1. Only human-only work: accounts, projects, env vars, dashboards, OAuth scopes,
   SQL/migrations, approvals, browser testing. Never list what the agent can do itself.
2. One line per action, ordered by urgency, as a checkbox. Name the exact file, path,
   env var, or dashboard, and how to verify success.
3. Never print secret values. Refer to env vars by name and say where to paste them.
4. Separate "now" (dies without it) from "before merge" and "optional".
5. Mark risky/irreversible actions with a warning and the undo step.
6. Update the same `reports/<branch>.md` in place after every push; no duplicates.
7. Mirror the report in chat as a copy-paste checklist, even if the file exists.
8. The human should be able to act without reading the rest of your message.
