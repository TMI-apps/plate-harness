# Rules registry (SSOT for skill cross-links)

Canonical paths for `.cursor/rules/` when skills need a rules table. Full descriptions: [`.cursor/rules/INDEX.md`](../../../../.cursor/rules/INDEX.md).

| Topic | Rule file |
|-------|-----------|
| Overview / index | `.cursor/rules/INDEX.md` |
| Architecture | `.cursor/rules/architecture/RULE.mdc` — layers, import direction, path aliases, structure whitelist |
| File placement | `.cursor/rules/file-placement/RULE.mdc` and `projectStructure.config.cjs` |
| Code style | `.cursor/rules/code-style/RULE.mdc` — naming (category, not first instance), complexity limits |
| Database | `.cursor/rules/database/RULE.mdc` — migrations, idempotent patterns |
| Security | `.cursor/rules/security/RULE.mdc` — auth, RLS, validation, secrets |
| Testing | `.cursor/rules/testing/RULE.mdc` |
| Workflow hub | `.cursor/rules/workflow/RULE.mdc` — code review, dev process, routing |
| Git workflow | `.cursor/rules/git-workflow/RULE.mdc` — mode config `src/config/git-workflow.json`; § Mode-aware branch gate; PRs (Model A); promote |
| Agent behavior | `.cursor/rules/agent-behavior/RULE.mdc` — protected files, decision protocol |
| Platform | `.cursor/rules/platform/RULE.mdc` — PowerShell, env vars |
| Cloud / Edge | `.cursor/rules/cloud-functions/RULE.mdc` — when applicable |
| External API integration | `.cursor/rules/api-integration/RULE.mdc` — MCP-first, doc research, POC before code |
| Debugging | `.cursor/rules/debugging/RULE.mdc` — when diagnosing complex issues |
| Project-specific | `.cursor/rules/project-specific/RULE.mdc` — when applicable |

**Callers:** `plan`, `implement`, `quick-piv`, `validate` — link here; do not copy this table into skill bodies.
