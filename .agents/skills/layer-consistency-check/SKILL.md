---
name: layer-consistency-check
description: >-
  PROACTIVE on any request to change existing behavior (and on minimizer/exception
  language, first-of-a-kind instances, behavior-by-analogy): verify the user's
  assumption about how the system works before acting — they can't see the
  implementation, so the assumption is often wrong. REACTIVE when the diff matches
  a workaround shape (special-case flag, parallel path, symptom tuning, disconnected
  patch, instance-encoded naming, growing scope, "for now" comment) or mid-impl when
  your own code starts to look like a workaround. Posts WARNING, WORKAROUND and stops
  until the user chooses. Not industry precedent (pattern-review), repo lint
  (validate), or post-hoc wrong-layer repair (consolidate). Always-on via
  architecture/RULE.mdc § Layer consistency.
disable-model-invocation: false
---

# layer-consistency-check

**Scope:** Catch requests or in-progress code that violate a deeper layer underneath what was literally asked for — physical/mathematical constraints, an existing abstraction or naming hierarchy, or system-architecture assumptions — **before** silently building a workaround on top.

**Feedback first** — surface the mismatch and structural alternative; do not write workaround code until the user chooses.

## Proactive obligation (agents)

Apply **without being asked** during any implementation task when request-side cues or implementation-side shapes appear (see [`references/workaround-shapes.md`](references/workaround-shapes.md)). Obligation is also stated in `.cursor/rules/architecture/RULE.mdc` § Layer consistency (workaround guard).

**Do:** one-beat layer check → **shape #5 first** (read `.agents/skills/name-the-mechanism/SKILL.md` for any new or copied symbol; the one-off skip does not suppress that skill or the second-copy marker) → for every other shape, severity filter (skip a genuinely one-off exception with no recurring cost) → if that shape still clears the bar, post alert from [`references/alert-template.md`](references/alert-template.md) → **stop** until owner picks workaround vs structural path.

**Do not:** treat local compliance within the request's phrasing as sufficient without checking the layer beneath.

## Core reflex (all coding tasks)

Every request carries the user's **assumption about how the system works** — and the user can't see the actual implementation, so the assumption is often wrong. **Verify it before acting.**

Trigger: any request to change existing behavior ("add a color to the gradient", "make it splash", "just add a field/button/flag"), plus the request-side cues in the shapes rubric. Mid-implementation: stop whenever your own code starts to look like a workaround (implementation-side shapes).

## The core error this guards against

**Local compliance without layer-consistency checking**: when the request conflicts with a deeper layer, silently absorbing the conflict by adding a workaround. The workaround becomes new surface area that hides the original mismatch, and the cost compounds every time something else gets built on top.

The requester usually can't see this coming. Catch what they can't see — not tradeoffs they've already flagged explicitly.

## Where everything lives

Per [`documentation/DOC_AGENT_WORKFLOW_LAYERS.md`](../../../documentation/DOC_AGENT_WORKFLOW_LAYERS.md).

| What | Path |
|------|------|
| **Procedure** (this file) | `.agents/skills/layer-consistency-check/SKILL.md` |
| **Detection rubric** (cues + seven shapes + severity) | `.agents/skills/layer-consistency-check/references/workaround-shapes.md` |
| **Alert template** | `.agents/skills/layer-consistency-check/references/alert-template.md` |
| **Always-on reminder** | `.cursor/rules/architecture/RULE.mdc` § Layer consistency (workaround guard) |

---

## Procedure

1. Read [`references/workaround-shapes.md`](references/workaround-shapes.md).
2. **Proactive:** on request-side cues, run the one-beat layer check before writing code.
3. **Reactive:** while implementing, stop when the diff matches a workaround shape.
4. **Naming first (shape #5).** Read `.agents/skills/name-the-mechanism/SKILL.md` and apply it before writing the name. The one-off skip does not apply. If the name or copy count still violates that skill, stop with WARNING.
5. **Other shapes.** Skip a genuinely one-off exception with no recurring cost.
6. If a non-naming shape still clears that filter → post **WARNING, WORKAROUND** from [`references/alert-template.md`](references/alert-template.md) → **stop** until the user chooses.
7. If the user picks the **structural alternative**: IF scope is XS/S THEN `quick-piv`; IF multi-phase/migration/contracts THEN `plan` (cite router § implement vs quick-piv). If they pick the workaround → implement as asked.
8. **When invoked from `improve`:** treat the IMPROVE finding text + target name as the proactive cue; run the one-beat check before any code.

---

## Examples (abbreviated)

Full domain variety is in the shapes rubric. Illustrative cases:

- **Fluid sim:** "can waves just splash over that wall?" on a shallow-water solver → disconnected particle burst vs different representation.
- **Game design:** double-jump in one level → level-specific ability flag vs reach invariant redesign.
- **TypeScript UI:** `BreadBuyButton` is an example of encoding the first product. Judge it with `.agents/skills/name-the-mechanism/SKILL.md`. Do not skip the check as a one-off.
- **Design systems:** one-off modal corners → inline override vs token change.
- **Backend/schema:** `discount_percent` for one promo → UI subtraction vs pricing-engine extension.

---

## What this is NOT

| Concern | Use instead |
|---------|-------------|
| External industry / product precedent | [`pattern-review`](../pattern-review/SKILL.md) |
| Package / pattern reuse vs custom code | [`dont-reinvent-the-wheel`](../dont-reinvent-the-wheel/SKILL.md) |
| Heavy DB/UI operation cost | `architecture/RULE.mdc` § Performance cost risk |
| Repo rule compliance on plan or diff | [`validate`](../validate/SKILL.md) |
| Post-hoc wrong-layer repair in existing code | [`consolidate`](../consolidate/SKILL.md) § Semantic placement |
| Front door when technique unknown (`/improve`) | [`improve`](../improve/SKILL.md) |
| Simplify an overbuilt feature workflow | [`challenge`](../challenge/SKILL.md) |
| Should we / how to align existing scope with industry standards | [`standards-align`](../standards-align/SKILL.md) |
| Hotspot refactor / Rule of Three | [`optimize2`](../optimize2/SKILL.md) |
| How to name new symbols, and when a copy must be extracted | `.agents/skills/name-the-mechanism/SKILL.md` — this skill only **stops** if that skill is violated |

**When both `pattern-review` and this skill apply:** run **layer-consistency-check first** (cheaper one-beat check). If the user picks a structural path that changes UX/API contracts, run `pattern-review` before implementing.

---

## Output (chat)

```markdown
Layer consistency: <passed — one-beat check | WARNING, WORKAROUND — see below>
```

If WARNING posted:

```markdown
Next: owner pick workaround vs structural alternative → then implement / plan / quick-piv
```

---

## Related

- [`pattern-review`](../pattern-review/SKILL.md) — industry precedent (complementary lens)
- [`standards-align`](../standards-align/SKILL.md) — should/how industry align on existing scope
- [`consolidate`](../consolidate/SKILL.md) — semantic placement repair (post-hoc)
- [`router`](../router/SKILL.md) § `pattern-review` vs `layer-consistency-check`
- [`learn`](../learn/SKILL.md) — persist lessons from resolved workaround debates
