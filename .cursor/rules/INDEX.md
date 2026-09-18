# Rules Index

Quick reference guide to all rules and their relationships.

## Rule Categories

### Code Style (`code-style/RULE.mdc`)
- Naming conventions (category, not first instance/SKU/page)
- Formatting standards
- Documentation requirements
- Code organization
- **Import ordering** (external first, then internal) - style concerns only
- **Styling scope standards** (always ask scope before implementing styling changes)
- **GTS linting** (default, with override option)
- **TypeScript strict mode** (required)
- **Complexity standards** (functions ≤ 10 cyclomatic, ≤ 15 cognitive, ≤ 100 lines)
- **Note:** Path aliases, import direction, and layer boundaries are defined in `architecture/RULE.mdc` (SSOT)

**Related to:** All other rules

---

### Architecture (`architecture/RULE.mdc`)
- Design principles
- **Project structure** (SSOT for folder organization)
- **Path aliases** (SSOT for `@/hooks/*`, `@/components/*`, etc. mappings)
- Patterns and practices
- **TanStack Query: plain optimistic + server-canonical response** (SSOT playbook—cache merge on success; avoid happy-path `invalidateQueries` for the same keys)
- Module organization
- Layer boundaries and import direction
- **Feature granularity / bounded context** (size budgets, cross-feature imports — `featureBudgets.config.cjs`)
- **Architecture documentation** (minimal contract-doc maintenance)
- **Pattern risk (industry precedent)** — pointer to `.agents/skills/pattern-review/` (plans/proposals; not repo lint)
- **Don't reinvent the wheel (package / pattern reuse)** — pointer to `.agents/skills/dont-reinvent-the-wheel/` (before custom generic subsystems; not pattern-review)
- **Performance cost risk (heavy DB/UI ops)** — detect heavy operations, propose leaner alternatives, ask user before implementing
- **Layer consistency (workaround guard)** — pointer to `.agents/skills/layer-consistency-check/` (verify assumptions; catch workarounds including instance-encoded names). Identifier naming SSOT: `code-style` § Category, not instance

**Related to:** code-style, testing, security, workflow

---

### Testing (`testing/RULE.mdc`)
- **Onboarding guide:** `documentation/DOC_TESTING.md` (runners, colocation, naming, examples)
- Test authority (failing test = claim, not ground truth)
- Local test authority (commit vs merge tiers)
- Test coverage requirements
- Testing patterns
- Test organization
- Quality standards

**Related to:** code-style, architecture, workflow

---

### Security (`security/RULE.mdc`)
- Authentication & authorization
- Input validation
- Data protection
- Vulnerability prevention

**Related to:** architecture, code-style, workflow

---

### Workflow hub (`workflow/RULE.mdc`)
- Code review process and development process
- Deployment pointers (links to `DOC_CLOUDFLARE_WORKERS`, `cloud-functions/RULE.mdc`)
- **Rule routing** to child domain rules (do not duplicate their bodies here)
- **Minimal branch gate stub** — read `src/config/git-workflow.json`; full Model A / Model B in `git-workflow/RULE.mdc` § Mode-aware branch gate

**Related to:** All other rules (references them in review process)

---

### Git workflow (`git-workflow/RULE.mdc`)
- **Branch and release strategy** (SSOT: Model A default or Model B opt-in — config: `src/config/git-workflow.json`; behavior: `git-workflow/RULE.mdc`)
- Branch protection, PR standards (Model A), merge diagnostics
- **Promote to production** workflow (both modes)
- Commit/push flow pointers (`finish` / `push` skills for semver/changelog SSOT)

**Related to:** workflow hub, agent-behavior, platform

---

### Agent behavior (`agent-behavior/RULE.mdc`)
- Protected files manifest (single SSOT)
- Decision questioning protocol
- Success validation (user-test gate)
- Agent role and control

**Related to:** workflow hub, git-workflow, debugging

---

### Platform (`platform/RULE.mdc`)
- **PowerShell/Select-Object piping rules** (prevents IDE crashes)
- Windows command rules, `$LASTEXITCODE` handling
- Environment variable catalog (`VITE_*`, Supabase, Edge secrets)

**Related to:** workflow hub, git-workflow, security

---

### Cloud Functions (`cloud-functions/RULE.mdc`)
- **When to use Edge Functions** vs frontend logic (decision framework)
- Function organization by business capability
- Deployment model and fragility considerations
- Testing strategy and migration paths

**Related to:** architecture, workflow, security

---

### Database (`database/RULE.mdc`)
- **SQL migrations only** (`supabase/migrations/`) — not client queries or TanStack
- Safe migration patterns (idempotent, handles fresh/existing databases)
- New-table checklist (RLS, indexes, type generation)
- Layer boundaries (pointers to `architecture/RULE.mdc`, `DOC_TANSTACK_QUERY.md`)
- Testing migrations (fresh database and incremental updates)
- Error handling and logging patterns

**Related to:** security, workflow, architecture

---

### API Integration (`api-integration/RULE.mdc`)
- **MCP-first check** before assuming REST/scripts/browser fetch is the only path
- Doc-freshness (don't trust cached/stale docs)
- Cite doc URL(s) or MCP tool(s) actually used
- POC-before-code for new/unfamiliar vendors
- Pointer to `.agents/skills/api-integrate/SKILL.md` for the full procedure (MCP fallback decision tree, schema→sample discipline, vendor worked examples)
- Absorbs the former `workflow/RULE.mdc` § Documentation Lookup

**Related to:** workflow, security, database, cloud-functions, project-specific

---

### Debugging (`debugging/RULE.mdc`)
- Debugging strategies and logging practices
- Pointers to `debug` and `hypothesis` skills for scientific-method procedure
- Reductive strategy for bugs and new features

**Related to:** workflow, testing, architecture

---

### Project-Specific (`project-specific/RULE.mdc`)
- Rate limiting patterns for Edge Functions
- Project-specific security implementations
- Implementation examples and checklists

**Related to:** security, cloud-functions, database

---

### File Placement (`file-placement/RULE.mdc`)
- **Validate file and folder placement before creation** (mandatory pre-creation check)
- Project structure validation using `projectStructure.config.cjs`
- Architecture compliance verification
- Guidance for correct file/folder locations
- **Feature-local README (Option 1):** SSOT `documentation/DOC_FEATURE_LOCAL_README.md`; `pnpm validate:feature-docs` / `validate:feature-docs:strict` / `validate:feature-docs:staged`
- **Feature size / granularity:** SSOT `featureBudgets.config.cjs`; `pnpm validate:feature-size` / `validate:feature-size:staged`; see `.cursor/rules/architecture/RULE.mdc` § Feature granularity

**Related to:** architecture, workflow

---

## Consistency Check Matrix

When modifying a rule, check these related rules:

| Rule | Check These Rules |
|------|-------------------|
| `code-style` | architecture, testing, workflow |
| `architecture` | code-style, testing, security, workflow, cloud-functions, database |
| `testing` | code-style, architecture, workflow, debugging |
| `security` | architecture, code-style, workflow, cloud-functions, database, project-specific, api-integration |
| `workflow` | All rules (hub), git-workflow, agent-behavior, platform, api-integration |
| `git-workflow` | workflow, agent-behavior, platform, cloud-functions, testing |
| `agent-behavior` | workflow, git-workflow, debugging, finish skill |
| `platform` | workflow, git-workflow, security |
| `cloud-functions` | architecture, workflow, security, project-specific |
| `database` | security, workflow, architecture |
| `api-integration` | workflow, security, database, cloud-functions, project-specific |
| `debugging` | workflow, testing, architecture |
| `project-specific` | security, cloud-functions, database |
| `file-placement` | architecture, workflow |

## Adding a New Rule

1. Create folder: `rules/[category]/` (e.g. `rules/my-category/`)
2. Create `RULE.mdc` following the template in an existing rule
3. Add "Related Rules" section at the bottom
4. Update this INDEX.md
5. Update related rules to reference the new rule

