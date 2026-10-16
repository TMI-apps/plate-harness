---
name: standards-align
description: >-
  Decide whether a product, feature, or component should move closer to industry
  standards, then propose how (trim / streamline / reframe) and hand off to the
  right execution skill. Use when the user asks "should we align with industry
  standards?", "more industry-standard?", "how do we get closer to common
  practice?", or wants simplification opportunities that also align with
  mainstream product patterns. Not a proactive plan gate (use pattern-review for
  that) and not repo-rule lint (use validate).
disable-model-invocation: false
---

# standards-align

**Scope:** Answer two questions for a named unit of work:

1. **Should** this product / feature / component align more with industry practice?
2. **How** — lowest-cost path that closes the gap?

**Feedback first** — map, score, and options only. Do not edit product code until the owner picks Stay / Align-* / Mixed (and then a how option). Report what was verified and what was not; the user confirms in-app behavior.

## What this is NOT

| Concern | Use instead |
|---------|-------------|
| Front door when technique unknown (`/improve`) | [`improve`](../improve/SKILL.md) |
| Proactive industry check on a **plan/proposal** before novel `src/` work | [`pattern-review`](../pattern-review/SKILL.md) |
| Internal layer / workaround shapes | [`layer-consistency-check`](../layer-consistency-check/SKILL.md) |
| Simplify one feature **without** asking “vs market?” | [`challenge`](../challenge/SKILL.md) |
| Cross-feature duplication only | [`consolidate`](../consolidate/SKILL.md) |
| Repo rule compliance | [`validate`](../validate/SKILL.md) |

**Rubric SSOT:** Do **not** copy the industry lens. Phase 3 reads [`pattern-review/references/rubric.md`](../pattern-review/references/rubric.md). This skill owns the **should** gate and **how** orchestration.

**When both `pattern-review` and this skill could apply:**

- Mid-plan / novel UX gate → **`pattern-review`** (proactive).
- User asks “should we align?” / “how to align [existing scope]?” → **`standards-align`** (this skill). After Align decision, hand off; if contracts change, a later `pattern-review` pass is fine.

**When both this skill and `layer-consistency-check` apply:** run **layer-consistency-check** first if workaround cues appear; then continue this loop.

---

## Required input

Confirm before analysis:

1. **Scope unit** — product | feature | component (required)
2. **Named target** — what surface/workflow (required)
3. **User outcome** — what success means for the end user (required)
4. **Constraints** — must-keep compliance, brand, contracts, data (required if known)
5. **Precedent hints** — optional (“like Stripe / Linear / …”)

If target or outcome is unclear, ask concise questions and wait. Optional: `grill-me` when product vision is the blocker.

---

## Procedure (Standards Align Loop)

### Phase 1 — Bound scope

- State unit: **product** | **feature** | **component**
- Short in-scope / out-of-scope list
- Capability label in market terms (e.g. CRUD list, OAuth connect, settings, onboarding)

### Phase 2 — Map current

Compact only:

- User steps / surfaces
- Contracts (routes, APIs, persistence)
- Custom or odd bits (mark as suspect)

No code edits.

### Phase 3 — Precedent scan

Follow [`pattern-review`](../pattern-review/SKILL.md) using its rubric:

1. Name **1–3** external precedents (not “we already do it in-repo”)
2. Select **relevant dimensions** only
3. Per dimension: ours vs common practice vs cost of diverging

Reuse verdict labels from the rubric. If material non-standard gaps exist, you may include a Pattern risk-style table; still continue to Phase 4 (this skill’s **should** decision is separate from pattern-review’s implement A/B/C).

### Phase 4 — Gap score

For each material gap, weigh:

| Factor | Favors Stay | Favors Align |
|--------|-------------|--------------|
| **User surprise** | Power users only | First-session confusion |
| **Agent / hire tax** | Rare path | Touched often by agents/devs |
| **Compound cost** | Isolated | Blocks next features |
| **Precedent strength** | Niche / no clear norm | Strong mainstream shape |
| **Switch cost** | Big rewrite / break contracts | Trim / rename / reframe UX |

**Should-labels** (pick one overall, or Mixed with per-dimension notes):

| Label | Meaning |
|-------|---------|
| `Stay` | Product-specific OK; document why |
| `Align-lite` | Close gaps with small UX/API moves |
| `Align-hard` | Reframe to mainstream pattern |
| `Mixed` | Align some dimensions; waive others |

Default bias: **prefer align** unless a hard constraint or documented product edge applies.

### Phase 5 — Should we? (mandatory stop)

Ask the owner:

> Align? **Stay** / **Align-lite** / **Align-hard** / **Mixed** — or waive with one-line reason.

Do **not** invent how-work or implement until they answer. Record the decision in chat (and in plan **Decisions made** if a plan exists).

If **Stay** or full waive → document rationale → stop (optional: note residual risks).

### Phase 6 — How (only after Align-* / Mixed)

Present progressive options. **Option shapes (Trim / Streamline / Reframe / optional Replace Flow) are owned by [`challenge`](../challenge/SKILL.md) § Phase 4** — reuse those labels; do not invent a parallel option taxonomy.

| Option | Meaning | Typical next skill |
|--------|---------|-------------------|
| **A Trim** | Drop custom extras; keep overall shape | `challenge` Phase 7 (or `quick-piv` if XS/S and no challenge session) |
| **B Streamline** | Match mainstream composition/flow | `challenge` Phase 7; re-check with `pattern-review` if contracts shift |
| **C Reframe** | New model = precedent | `plan` (M/L) or `feature` if product-level |

When handing to `challenge` after Should + How are decided: pass the STANDARDS ALIGN decisions as **constraints**; skip challenge Phases 1–6 re-grilling — go to **Phase 7** (or Phase 4 only if How was not yet chosen).

Route by unit:

- **Component** → `challenge` (code mode) ± design-system tokens
- **Feature** → `challenge` (flow + code)
- **Cross-feature / product** → per-surface align first, then `consolidate` if duplication remains; product-wide journeys → `feature` / `plan`

If the structural path risks a workaround shape → run [`layer-consistency-check`](../layer-consistency-check/SKILL.md) before implementing.

Stop again:

> Which how option: **A**, **B**, or **C**?

### Phase 7 — Execute handoff

After how choice, **read and run** the next skill (do not only name it):

- Approved small change → `challenge` Phase 7 (preferred) or `quick-piv` when XS/S and no open challenge session
- Multi-phase / contract change → `plan` (include STANDARDS ALIGN gap table + decisions as input) → later `implement`
- Cross-feature unify after align → `consolidate`
- IF Align-* / Mixed how choice changes `src/` OR pre-ship gate needed THEN [`validate`](../validate/SKILL.md); IF read-only gap report only THEN skip `validate` → user test

---

## Output template

Use this structure in chat:

```text
STANDARDS ALIGN: <scope name>
Unit: product | feature | component
Capability: …
Precedents: …

Map:
- Steps / surfaces: …
- Contracts: …
- Custom / suspect: …

Gaps:
| Dimension | Ours | Common | Score drivers | Note |
|-----------|------|--------|---------------|------|
| … | … | … | … | … |

Should we?: Stay | Align-lite | Align-hard | Mixed
Rationale: …

How (if aligning — omit until Should is answered, or show as draft marked pending):
A) Trim — …
B) Streamline — …
C) Reframe — …
Recommended: A|B|C because …
Next skill: challenge | consolidate | plan | quick-piv | …

Decision required:
1) Stay / Align-lite / Align-hard / Mixed / waive
2) After (1): which how option A/B/C?
```

On first stop, you may omit detailed How or mark it **pending decision** so the owner is not flooded — but always keep the Should gate explicit.

---

## Invocation rules

| When | Do |
|------|----|
| User asks should-we-align / how-to-align / industry-standard simplification for a **named existing scope** | Run full loop |
| Idle `/router` maps here from situation table | Same |
| Already waived for this scope and scope unchanged | Skip; one-line reminder |
| Pure plan gate before novel code | Prefer `pattern-review`, not this skill |

**Not proactive** on every plan — that remains `pattern-review`. This skill is **on-demand** (user or router).

---

## Related

- [`improve`](../improve/SKILL.md) — vague “make better” / `/improve` entry (may hand off here)
- [`pattern-review`](../pattern-review/SKILL.md) — industry rubric + proactive plan gate
- [`challenge`](../challenge/SKILL.md) — execute feature/component simplification
- [`consolidate`](../consolidate/SKILL.md) — cross-feature unify after align
- [`layer-consistency-check`](../layer-consistency-check/SKILL.md) — internal layer guard
- [`grill-me`](../grill-me/SKILL.md) — vision/tradeoff clarity before Phase 1
- [`plan`](../plan/SKILL.md) / [`quick-piv`](../quick-piv/SKILL.md) — after Align-hard / Trim

**Next:** Owner picks Should → How → invoke execution skill → `validate` → user test.
