# Cursor Rules Structure

This directory contains global User Rules that apply across all your projects.

## SSOT catalog

**`.cursor/rules/INDEX.md`** is the rule catalog and cross-reference matrix. Individual `RULE.mdc` files are SSOT for their domain.

This README describes folder layout and maintenance â€” it does **not** override INDEX or per-rule SSOT declarations.

- **`architecture/RULE.mdc`**: SSOT for project structure, directory organization, code placement, path aliases (`@/hooks/*`, `@/components/*`, etc.), and layer boundaries
- **`testing/RULE.mdc`**: SSOT for testing standards, patterns, and quality requirements
- **`code-style/RULE.mdc`**: SSOT for naming conventions, formatting, and documentation standards
- **`security/RULE.mdc`**: SSOT for security best practices and vulnerability prevention
- **`workflow/RULE.mdc`**: Hub for code review, development process, deployment pointers, and rule routing
- **`git-workflow/RULE.mdc`**: SSOT for branch strategy (§ Mode behavior table — Model C default, A/B selectable via `src/config/git-workflow.json`), PRs, and production
- **`agent-behavior/RULE.mdc`**: SSOT for protected files, decision protocol, and success reporting (verified vs unverified)
- **`platform/RULE.mdc`**: SSOT for PowerShell command rules and local environment configuration
- **`cloud-functions/RULE.mdc`**: SSOT for when to use Edge Functions vs frontend, and function organization
- **`database/RULE.mdc`**: SSOT for database migration best practices and patterns
- **`debugging/RULE.mdc`**: SSOT for debugging strategies, logging, and issue analysis
- **`file-placement/RULE.mdc`**: SSOT for file and folder placement validation before creation
- **`project-specific/RULE.mdc`**: SSOT for project-specific patterns (rate limiting, etc.)

**When rules reference content from other domains, they must explicitly reference the SSOT rule.**

Example: If `cloud-functions/RULE.mdc` mentions function locations, it should reference `architecture/RULE.mdc` as the SSOT for project structure.

## Rule Organization

Each rule is a folder containing a `RULE.mdc` file with:
- Frontmatter metadata (description, alwaysApply, globs)
- Rule content
- Cross-reference section for consistency checks
- **SSOT references** when content overlaps with other rules

## Rule Categories

- **code-style**: Naming conventions, formatting, documentation, import ordering (style concerns)
- **architecture**: Design patterns, module organization, structure (SSOT for project structure, path aliases, and layer boundaries)
- **testing**: Test coverage, testing patterns, quality gates (SSOT for testing standards)
- **security**: Security best practices, vulnerability prevention
- **workflow**: Development process hub, code review standards
- **git-workflow**: Branch strategy, PRs, production promotion
- **agent-behavior**: Protected files, agent decision protocol
- **platform**: PowerShell and environment configuration
- **cloud-functions**: Edge Functions architecture and organization
- **database**: Database migration best practices and patterns
- **debugging**: Debugging strategies, logging, and issue analysis
- **project-specific**: Project-specific rules (rate limiting, etc.)
- **file-placement**: File and folder placement validation before creation

## Adding a New Rule

1. Create a new folder: `rules/[category]/`
2. Create `RULE.mdc` with the standard template
3. Update this README with the new rule and its SSOT scope
4. Add cross-references to related rules
5. Reference SSOT rules when content overlaps

## Consistency Checks

When modifying a rule:
- Check the "Related Rules" section at the bottom of each `RULE.mdc` file
- Ensure SSOT references are correct and up to date
- Update this README if SSOT scope changes

## Rule Improvement and Maintenance

### Rule Improvement Triggers

Consider updating rules when:
- New code patterns not covered by existing rules emerge
- Repeated similar implementations appear across files
- Common error patterns could be prevented by a rule
- New libraries or tools are being used consistently
- Emerging best practices develop in the codebase

### Analysis Process

When identifying patterns for rule improvement:
- Compare new code with existing rules
- Identify patterns that should be standardized
- Look for references to external documentation
- Check for consistent error handling patterns
- Monitor test patterns and coverage

### When to Add New Rules

Add new rules when:
- A new technology/pattern is used in 3+ files
- Common bugs could be prevented by a rule
- Code reviews repeatedly mention the same feedback
- New security or performance patterns emerge

### When to Modify Existing Rules

Modify existing rules when:
- Better examples exist in the codebase
- Additional edge cases are discovered
- Related rules have been updated
- Implementation details have changed

### Rule Quality Standards

Rules should be:
- **Actionable and specific** - Clear guidance, not vague suggestions
- **Based on actual code** - Examples should come from real implementations
- **Up to date** - References should be current and accurate
- **Consistently enforced** - Patterns should be applied uniformly

### Minimal Documentation Promises Policy

To reduce stale documentation risk:

- Keep required docs objective and minimal:
  - `CHANGELOG.md` for user-facing changes
  - `ARCHITECTURE.md` for structural changes
  - `src/features/*/README.md` when feature code changes
- Treat deep docs (`src/features/*/docs/*.md`, additional `documentation/*.md`) as optional
- Create new deep docs only with explicit user approval
- Prefer source-adjacent comments/tests for implementation details
- Validate references automatically via `pnpm validate:docs`

### Pattern Recognition Example

```typescript
// If you see repeated patterns like:
const data = await prisma.user.findMany({
  select: { id: true, email: true },
  where: { status: 'ACTIVE' }
});

// Consider adding to the relevant rule:
// - Standard select fields
// - Common where conditions
// - Performance optimization patterns
```

### Continuous Improvement

- Monitor code review comments for recurring feedback
- Track common development questions
- Update rules after major refactors
- Add links to relevant documentation
- Cross-reference related rules

### Rule Deprecation

When deprecating rules:
- Mark outdated patterns as deprecated
- Remove rules that no longer apply
- Update references to deprecated rules
- Document migration paths for old patterns

### Documentation Maintenance

- Keep examples synchronized with code
- Update references to external docs
- Maintain links between related rules
- Document breaking changes

