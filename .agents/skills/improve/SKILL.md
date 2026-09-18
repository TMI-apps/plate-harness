---
name: improve
description: >-
  Product-facing front door for improving an existing product area, feature, or
  screen. Resolves target in plain language, checks vision only when missing,
  runs a silent multi-lens lite audit, shows at most three findings with one
  recommendation, then invokes the real skill (challenge, standards-align,
  consolidate, validate, review, layer-consistency-check). Use when the user
  types /improve, says improve / clean up / make better / this part is messy /
  too complicated / not how other apps do it, or wants quality help without
  picking a technique. Not for net-new features (use feature/plan) or active
  bugs (use debug).
disable-model-invocation: false
---

# improve

**Scope:** User-facing **entry** for “make this part better.” You interview lightly (or not at all), audit quietly, present ≤3 plain findings, then **read and run** the chosen downstream skill.

**Audience assumption:** The user may not know code. Speak in product language (screens, steps, feelings, “how other apps do it”). Never ask them to pick among skill names.

**Autonomy bias:** Prefer inferring from repo + `documentation/DOC_APP_VISION.md` + the named area. Ask at most **two** clarifying questions before the audit. Default recommendation; user can say `go` to accept it.

**Feedback first** until a downstream skill’s own decision gate says otherwise. Never claim success without user testing.

## What this is NOT

| Concern | Use instead |
|---------|-------------|
| Net-new capability / journeys with decision stops | [`feature`](../feature/SKILL.md) / [`plan`](../plan/SKILL.md) |
| Broken behavior / regression | [`debug`](../debug/SKILL.md) |
| Proactive industry check on a **new plan** | [`pattern-review`](../pattern-review/SKILL.md) |
| Always-on workaround guard mid-impl | [`layer-consistency-check`](../layer-consistency-check/SKILL.md) (still may be invoked from findings) |
| Direct “should we align?” with full loop already wanted | [`standards-align`](../standards-align/SKILL.md) |
| Direct “simplify this flow” already named | [`challenge`](../challenge/SKILL.md) |

If the user already names a specific technique and scope, skip this facade and invoke that skill.

---

## Plain-language labels (user-facing)

Use these words with the user. Map to skills only in agent reasoning:

| Say to user | Means (agent) |
|-------------|----------------|
| **Simplify steps** | `challenge` |
| **Match how other apps do it** | `standards-align` (rubric via `pattern-review`) |
| **Remove repeated work** | `consolidate` |
| **Fix a one-off exception** | `layer-consistency-check` |
| **Safety check before ship** | `validate` |
| **Score this screen’s quality** | `review` |

---

## Procedure (H + E + G hybrid)

### Phase 1 — Resolve target

From the message, open files, or `/tasks` item, state in **one line**:

> Improve: **\<product area / screen / flow\>** — \<pain or goal in plain words\>

If target is missing or could mean two areas, ask **one** question (product names, not file paths). Wait.

Infer unit: **product** | **feature** | **component/screen**. Prefer feature when unsure.

### Phase 2 — Vision check (only if needed)

Read `documentation/DOC_APP_VISION.md` (and feature README if present).

- Vision already covers this area → **skip** questions; note the relevant one-liner internally.
- Vision thin / conflicting / user offered a future sketch → ask **at most two** questions, e.g.:
  1. How should this part feel for the user in a few months?
  2. What must stay true (rules, brand, data you cannot drop)?

Optional: accept a short “future sketch” dump instead of Q&A. Do not run full `grill-me` unless vision is the real blocker across the app.

### Phase 3 — Silent multi-lens lite audit

Do **not** list lenses to the user. Internally scan the target (code + UX flow + docs) for signals:

| Lens | Look for | Likely label |
|------|----------|--------------|
| Friction / overbuilt | Extra steps, decisions, nested UI | Simplify steps |
| Industry oddity | Diverges from familiar products | Match how other apps do it |
| Duplication | Same pattern in multiple features | Remove repeated work |
| Workaround / exception | “Just this one”, parallel path, special flag | Fix a one-off exception |
| Ship readiness | Recent changes, plan done, pre-merge | Safety check before ship |
| Component polish | Single UI piece, a11y/MUI quality | Score this screen’s quality |

Score lightly (user surprise, agent/hire tax, compound cost, switch cost). Keep at most **three** findings. Drop weak ones.

If a workaround cue is strong → finding #1 should be **Fix a one-off exception** (layer-consistency-check first).

### Phase 4 — Present findings (≤3)

Use the output template below. Rules:

- Plain language only; no skill names, paths, or rubrics in the user-facing block
- **Recommend one** (usually #1)
- Offer: reply **`1` / `2` / `3`**, or **`go`** for the recommendation
- Optional depth: **Quick** (one focused fix) / **Solid** (default) / **Sweep** (cross-feature) — only if user has not implied budget; default **Solid**

**Stop** until they pick (or `go`). Exception: they already said “just fix the worst thing” / “go ahead” in the opening message → treat as `go`.

### Phase 5 — Invoke downstream skill

Map the chosen finding → skill. **Read that skill’s `SKILL.md` and execute it in the same turn** (router invocation contract). Pass:

- Target name + unit
- User outcome / future sketch
- Constraints from Phase 2
- Depth (Quick → prefer `quick-piv` or challenge Trim; Solid → full child skill; Sweep → allow consolidate / plan)
- Finding text (so children can treat it as intake)

| Finding label | Invoke | Extra handoff rules |
|---------------|--------|---------------------|
| Simplify steps | [`challenge`](../challenge/SKILL.md) | Full challenge unless arriving mid-options |
| Match how other apps do it | [`standards-align`](../standards-align/SKILL.md) | Full loop |
| Remove repeated work | [`consolidate`](../consolidate/SKILL.md) | Pass Target; child sweeps `src/`, focuses Target ∪ 1-hop neighborhood |
| Fix a one-off exception | [`layer-consistency-check`](../layer-consistency-check/SKILL.md) | Finding + target = proactive cue |
| Safety check before ship | [`validate`](../validate/SKILL.md) | Pass scope paths and/or active `DEVELOPMENT_PLAN.md` before invoke |
| Score this screen’s quality | [`review`](../review/SKILL.md) | Only when a **component path** is identified; else re-pick |

After the child skill finishes its stop-gate / work, return to the user in product language. If more findings remain and they want another pass, re-enter Phase 4 with remaining items (do not restart vision).

---

## Output template

```text
IMPROVE: <area name>

Target: <one-line confirmation>
Vision: <ok | noted from you | asked Qs — summary>

What I noticed (max 3):
1) <plain finding> — why it matters for users
2) …
3) …

Recommended: #1 — <short why>
Depth: Solid (say Quick / Solid / Sweep to change)

Reply 1, 2, or 3 — or go for the recommendation.
```

---

## Opening message patterns

| User says | Start behavior |
|-----------|----------------|
| `/improve` only | Ask for area (one Q), then Phases 2–4 |
| `/improve` + area | Phase 1 confirm → 2–4 |
| Pain sentence (“export takes forever”) | Infer target + finding bias → audit → Phase 4 |
| Future sketch | Treat as Phase 2 input → audit toward that future |
| Artifact (ticket, “users say…”) | Extract target + pain → one-line confirm → audit |
| “Just fix the worst” | Audit → auto-`go` on #1 after showing the IMPROVE block once |

---

## Boundaries

- Do **not** show a menu of skill names.
- Do **not** run all downstream skills in parallel as equal primaries.
- Do **not** replace proactive `pattern-review` / `dont-reinvent-the-wheel` / `layer-consistency-check` obligations elsewhere.
- Do **not** implement before the child’s own decision gates (e.g. standards-align Should; challenge A/B/C).
- Keep the facade thin: routing + plain findings — procedures stay in child skills.

---

## Related

- [`router`](../router/SKILL.md) — situation → improve
- [`standards-align`](../standards-align/SKILL.md)
- [`challenge`](../challenge/SKILL.md)
- [`consolidate`](../consolidate/SKILL.md)
- [`layer-consistency-check`](../layer-consistency-check/SKILL.md)
- [`validate`](../validate/SKILL.md)
- [`review`](../review/SKILL.md)
- [`grill-me`](../grill-me/SKILL.md) — only if app-wide vision is the blocker

**Next:** User picks 1/2/3 or `go` → invoke child skill → user test.
