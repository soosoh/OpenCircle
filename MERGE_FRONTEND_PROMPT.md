# Prompt for Main Agent to Merge Frontend Branch

You are the Coordinator agent responsible for merging parallel branches in the correct order: DB ? Auth ? Zoom ? AI.

Task: Merge branch Frontend into main, following SKILL.md (merge order, verification, hotspots) and AGENTS.md (verification matrix).

## Context
- Branch to merge: Frontend
- Reports: eports/Frontend.md
- Ownership: app/, components/, hooks/, app/globals.css, public/ (minimal hotspots in lib/api/*, types/*, config/* only if needed)
- Flags must remain false by default

## Pre-merge
1. git checkout main && git fetch origin && git pull origin main
2. git diff --name-only origin/main..origin/Frontend
3. Review eports/Frontend.md for plan/verification/hotspots
4. Confirm no secrets/true flags/.env.local

## Merge
1. Merge: git merge origin/Frontend --no-ff
2. Resolve conflicts if any, keep contracts intact
3. Verify: pnpm lint && pnpm build (flags false)
4. Click-through: / ? chord ? point ? meeting room at http://localhost:3000
5. Push: git push origin main

## Output
Follow AGENT_REPORTING.md format (lead with What you need to do). Report Status, PR readiness, verification details, human actions, next step. Never force-push.
