# Dev-cycle matrix (router)

Compact guidance for **next-step mode**. Compress, skip, or reorder when scope, risk, or discoveries demand it.

**`/router`:** Thread continuation first (mid-task → logical next skill); backlog intake only when idle. See [router § `/router` — pick next action + skill](../SKILL.md).

**Skill inventory:** [`.agents/skills/router/SKILL.md`](../SKILL.md) § Skill index.

## Optimistic happy path

1. Spar / pin goal — router gates 1–2; optional `grill-me` warm start → `DECISIONS.md`.
2. **Plan corridor** — `plan` Refine → Investigate → Create with **`plan-grill` rail** (fork checklist each phase; anti-dup via `DECISIONS.md`; **`plan-grill-auto`** when the user forbids questions); writes `DEVELOPMENT_PLAN.md` with Complexity and compliance. **`dont-reinvent-the-wheel`** during Investigate when a generic subsystem is in play.
3. **Pattern & precedent** — `pattern-review` `plan-section` when M/L or material behavioral design (part of `plan` step 5).
4. **Plan review** — `review-dev-plan` required for Complexity **M** or **L**; optional for **XS/S** unless risk or user request.
5. **Plan compliance** — `validate` (plan-review mode) for repo-rule compliance on the plan when M/L or user requests.
6. **Implement** — `implement` executes phases and gates.
7. **Validate** — repo rules and/or architecture gate when warranted (auto-selects impl-full / gate depth).
8. **Finish** — local commit, version, changelog.
9. **Push** — remote sync after commits exist.
10. **Babysit / post-push CI** — read `src/config/git-workflow.json`. **Model A:** when a PR to `develop` exists after push, run `~/.cursor/skills-cursor/babysit/SKILL.md`. **Model B:** after push to `develop` or `main`, report the commit URL and stop. Do not `gh run watch`. Skip the Model A babysit only when waived in **Decisions made**.
11. **User app test** — agent emits **Ready for you to test** handoff (`finish` § User test); user pass/fail closes the loop.

Optional: `prime` when codebase or branch context is unfamiliar.

## Decision cues (router)

| Situation | Usually next |
|-----------|----------------|
| Goal unclear | `grill-me` (warm start) and/or `plan` § Refine (gate 2); if already in plan → `plan-grill` rail; user forbids questions → `plan-grill-auto` |
| Product/scope fork in plan corridor | `plan-grill` rail via `plan` (checklist; anti-dup `DECISIONS.md`); `plan-grill-auto` when the user forbids questions |
| Novel UX/API/architecture without documented precedent | `pattern-review` then `plan` with **Pattern & precedent** |
| Nontrivial generic subsystem; unclear if a package/pattern exists | `dont-reinvent-the-wheel` then continue `plan` / `implement` |
| Complexity M/L + plan review pending | `review-dev-plan` |
| Implementing without plan but material design questions | `pattern-review` `lite`; then `plan` or waiver in **Decisions made** |
| Ready to land | `finish` → `push` → post-push CI (Model A: PR babysit; Model B: report URL and stop) → user test handoff |
| Bug / error / regression (not feature request) | `debug` (§ Chat intake) before `implement` |
| Pushed; CI unknown | Read mode config — Model A: babysit PR; Model B: watch `develop` `test` run |

## Plan depth and gates

- **XS/S** — lighter plan; `review-dev-plan` optional unless risk.
- **M/L** — full plan + **Pattern & precedent** + `review-dev-plan` before `implement` unless waived.

**`quick-piv`:** only when scope is small, risk low, and industry-precedent review is unnecessary or already satisfied.
