# Documentation Index

Central navigation for plate-harness documentation. For authoritative rules and process, see the SSOT locations below.

## Quick Links

| Topic | Document |
|-------|----------|
| **How to contribute safely** | [DOC_CONTRIBUTING.md](./DOC_CONTRIBUTING.md) |
| **Agent: session context (prime)** | [`.agents/skills/prime/SKILL.md`](../.agents/skills/prime/SKILL.md) |
| **Agent: development plan (plan)** | [`.agents/skills/plan/SKILL.md`](../.agents/skills/plan/SKILL.md) |
| **Agent: execute plan (implement)** | [`.agents/skills/implement/SKILL.md`](../.agents/skills/implement/SKILL.md) |
| **Agent: validate plan or implementation** | [`.agents/skills/validate/SKILL.md`](../.agents/skills/validate/SKILL.md) |
| **Agent: route ambiguous work (router)** | [`.agents/skills/router/SKILL.md`](../.agents/skills/router/SKILL.md) |
| **Agent: industry precedent (pattern-review)** | [`.agents/skills/pattern-review/SKILL.md`](../.agents/skills/pattern-review/SKILL.md) |
| **Agent: external API integration (api-integrate)** | [`.agents/skills/api-integrate/SKILL.md`](../.agents/skills/api-integrate/SKILL.md) |
| **Agent: multi-lens plan critique (review-dev-plan)** | [`.agents/skills/review-dev-plan/SKILL.md`](../.agents/skills/review-dev-plan/SKILL.md) |
| **Agent: write adoption guides (write-adoption-guide)** | [`.agents/skills/write-adoption-guide/SKILL.md`](../.agents/skills/write-adoption-guide/SKILL.md) |
| **Agent workflow layers (skills vs rules)** | [DOC_AGENT_WORKFLOW_LAYERS.md](./DOC_AGENT_WORKFLOW_LAYERS.md) — includes **Agent-only mode** (human files features/bugs) |
| **Handoffs (portable notes)** | [handoffs/README.md](./handoffs/README.md) |
| **Agent: lightweight PIV (quick-piv)** | [`.agents/skills/quick-piv/SKILL.md`](../.agents/skills/quick-piv/SKILL.md) |
| **Agent skill: persist lessons (learn)** | [`.agents/skills/learn/SKILL.md`](../.agents/skills/learn/SKILL.md) |
| **Architecture** | [ARCHITECTURE.md](../ARCHITECTURE.md) |
| **Architecture migration** | [DOC_ARCHITECTURE_MIGRATION_INSTRUCTIONS.md](./DOC_ARCHITECTURE_MIGRATION_INSTRUCTIONS.md) |
| **Agent: human onboarding (start)** | [`.agents/skills/start/SKILL.md`](../.agents/skills/start/SKILL.md) |
| **App vision & goals (fillable)** | [DOC_APP_VISION.md](./DOC_APP_VISION.md) |
| **Dev task backlog** | [src/features/tasks/README.md](../src/features/tasks/README.md) |
| **TanStack Query** | [DOC_TANSTACK_QUERY.md](./DOC_TANSTACK_QUERY.md) |
| **Testing (runners, placement, patterns)** | [DOC_TESTING.md](./DOC_TESTING.md) |
| **Feature-local README enforcement** | [DOC_FEATURE_LOCAL_README.md](./DOC_FEATURE_LOCAL_README.md) |
| **Supabase: Sign in with Google (dashboard setup)** | [DOC_SUPABASE_GOOGLE_OAUTH.md](./DOC_SUPABASE_GOOGLE_OAUTH.md) |
| **Mobile local dev (physical device)** | [DOC_MOBILE_LOCAL_DEV.md](./DOC_MOBILE_LOCAL_DEV.md) |
| **Cloudflare Workers deployment** | [DOC_CLOUDFLARE_WORKERS.md](./DOC_CLOUDFLARE_WORKERS.md) |
| **Complexity reduction** | See `.cursor/rules/architecture/RULE.mdc` complexity section |

## SSOT Map (Single Source of Truth)

| Topic | SSOT Location |
|-------|----------------|
| Workflow, versioning, changelog | `.agents/skills/finish/SKILL.md` |
| Branch strategy, release promotion flow | `.cursor/rules/git-workflow/RULE.mdc` (mode: `src/config/git-workflow.json`) |
| Git workflow mode selector | `src/config/git-workflow.json` + `src/config/git-workflow.README.md` |
| Protected files, agent behaviors | `.cursor/rules/agent-behavior/RULE.mdc` |
| PowerShell / local environment | `.cursor/rules/platform/RULE.mdc` |
| Code review, development process (hub) | `.cursor/rules/workflow/RULE.mdc` |
| Architecture patterns | `.cursor/rules/architecture/RULE.mdc` |
| Project structure | `projectStructure.config.cjs` |
| Dependency rules | `.dependency-cruiser.cjs` |
| **Dev task backlog / onboarding checklist** | `src/config/app-tasks.json` + `src/features/tasks/README.md` |
| **App vision & goals (problem, persona, app role)** | `documentation/DOC_APP_VISION.md` |
| **Agent workflow layers** | `documentation/DOC_AGENT_WORKFLOW_LAYERS.md` |
| **Supabase + Google OAuth (dashboard / Google Cloud)** | `documentation/DOC_SUPABASE_GOOGLE_OAUTH.md` |
| **Mobile local dev on physical device** | `documentation/DOC_MOBILE_LOCAL_DEV.md` |
| **Cloudflare Workers deployment** | `documentation/DOC_CLOUDFLARE_WORKERS.md` + `wrangler.jsonc` |
| **Testing (runners, colocation, patterns)** | `documentation/DOC_TESTING.md` |
