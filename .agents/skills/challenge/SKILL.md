---
name: challenge
description: >-
  Challenges and simplifies a concrete feature to reduce steps, clicks, and cognitive load
  (flow and code modes by default). Use when the user targets a workflow and asks whether it
  is overbuilt, or runs /challenge.
---

# challenge

Challenge and simplify a specific feature to reduce steps, clicks, and cognitive load.

Use this command when the user points to a concrete feature/workflow and wants to question whether it is overbuilt.

## Modes

This command supports two analysis modes:

- **Flow Mode:** Reduce user-facing steps and decisions in the feature workflow
- **Code Mode:** Simplify implementation structure for readability and minimal transformations

**Default behavior (mandatory):** When a feature is targeted, run **both modes** in one challenge pass.

Only run a single mode if the user explicitly asks for mode scoping.

## Purpose

Find the shortest path to the same outcome by:
- Removing unnecessary steps
- Merging redundant steps
- Reducing decisions and configuration burden
- Leveraging existing behavior instead of adding new abstractions

This command is intentionally narrow. It does not run broad repo optimization sweeps.

---

## Required Input

Before analysis, confirm:
1. Target feature/workflow (required)
2. User goal/outcome (required)
3. Current pain (optional but recommended)
4. Constraints that must remain (required if known)

If target or goal is unclear, ask concise clarifying questions and wait.

---

## Core Principle

**Simplify before optimizing.**

Prefer this order:
1. Remove
2. Merge
3. Reorder
4. Automate/default
5. Refactor
6. Add new code (last resort)

Never code-golf for character count. Prefer linear readability and maintainability over brevity.

---

## Challenge Lenses (Use all)

For the selected feature, challenge assumptions with these lenses:

1. **Existence:** Does this step need to exist?
2. **Value:** What user value is gained by this step?
3. **Redundancy:** Is this duplicated elsewhere?
4. **Timing:** Can this happen later, lazily, or in background?
5. **Defaulting:** Can smart defaults remove choice?
6. **Combination:** Can two steps become one?
7. **Trust boundary:** Can server/source-of-truth eliminate client-side complexity?
8. **Failure mode:** If removed, what actually breaks?

## Code Audit Lenses (Mandatory in Code Mode)

When code is provided (or when challenging a feature implementation), run this internal audit:

1. **Data Flow**
   - Is data changing shape more times than necessary?
   - Are there redundant `map`/`filter`/`reduce` chains that can be consolidated?
   - Can the same intent be expressed in fewer transformations without reducing clarity?

2. **Control Flow**
   - Is logic deeply nested?
   - Can guard clauses (early returns) flatten indentation and clarify happy path?

3. **Sparseness**
   - Is there boilerplate or speculative generality ("just in case" logic)?
   - Can custom logic be replaced by standard language/runtime features?

4. **Abstraction**
   - Are there premature abstractions hiding the story of the code?
   - Should thin wrappers/pass-through helpers be inlined for clearer data flow?

---

## Analysis Workflow

### Phase 1: Map the Current Feature (Flow + Code Surface)

Produce a compact map:
- Entry point
- Ordered steps
- Decision points
- Exit/success state
- Error paths
- Primary files/functions implementing the flow

Then report:
- Total steps
- Required user decisions count
- Required inputs count

### Phase 2: Run Dual Audit

#### 2A. Flow Audit

Apply challenge lenses to workflow steps.

#### 2B. Code Audit

Apply code audit lenses to key implementation files/functions.
Check specifically:
- unnecessary transformation chains
- nesting that should become guard clauses
- speculative/generalized code that can be removed
- abstractions that should be inlined

### Phase 3: Identify Reduction Opportunities

Tag each step with one action:
- `[delete]`
- `[merge-with:<step>]`
- `[default]`
- `[defer]`
- `[automate]`
- `[keep]`

For code-level findings, tag each candidate:
- `[prune]`
- `[flatten]`
- `[consolidate]`
- `[inline]`
- `[replace-with-standard]`
- `[keep]`

### Phase 4: Propose Progressive Simplification Options

Always present options from least disruptive to most transformative:

- **Option A - Trim:** Minimal edits, low risk, small step reduction
- **Option B - Streamline:** Moderate edits, medium risk, meaningful reduction
- **Option C - Reframe:** Strong simplification, higher impact, largest reduction

If needed, include:
- **Option D - Replace Flow:** New flow model only when A/B/C cannot meet goal

Each option must include:
1. Steps before -> after
2. Code complexity before -> after (brief, qualitative)
3. What is removed/merged/defaulted/pruned/flattened/consolidated
4. Risks/regressions
5. Estimated implementation scope
6. Why this is better for the stated user goal

### Phase 5: Context Questions Gate (Mandatory)

Before providing final refactor/implementation, ask **1 to 3** targeted business/edge-case questions when uncertainty exists.

Examples:
- "Must this data shape remain stable for downstream consumers?"
- "Can this validation be removed if upstream already guarantees it?"
- "Can this derived state be calculated on demand instead of stored?"

Wait for user answers before final implementation when questions are asked.

### Phase 6: User Decision Gate (Mandatory)

Stop and ask:
"Which option should I implement: A, B, C, or D?"

Do not implement until the user explicitly chooses.

### Phase 7: Execute Chosen Option

**This skill owns execution** after the user picks A/B/C/D — do not hand off to `quick-piv`/`implement` solely to apply the chosen option (unless the option is M/L and needs a durable `DEVELOPMENT_PLAN.md`, then hand to `plan` → `implement`).

Implementation rules:
- Keep changes minimal and local
- Reuse existing patterns and components
- Avoid new abstraction unless clearly justified
- Preserve required constraints from input
- Prefer guard clauses over deep nesting when it improves clarity
- Prefer fewer, clearer transformations when behavior stays equivalent
- **Commit only via `finish`** when the user requests a commit — never commit inside this skill

After changes:
- IF option changes `src/` THEN run lint + type-check; IF behavior change THEN run related tests or manual repro steps
- Report what changed and what was intentionally not changed
- Request user validation of behavior

Report outcomes faithfully: report what was verified and what was not; the user confirms in-app behavior.

---

## Output Template

Use this response format:

```text
FEATURE CHALLENGE: <name>

Current flow:
1) ...
2) ...
3) ...
Total steps: N
Decisions: D
Inputs: I
Primary implementation surface:
- <file/function>
- <file/function>

Reduction opportunities:
- Step 2 [delete] because ...
- Step 3 [merge-with:4] because ...
- Step 5 [default] because ...

Code simplification opportunities:
- <function> [flatten] because ...
- <function> [consolidate] because ...
- <function> [inline] because ...

Options:
A) Trim
- Steps: N -> X
- Code complexity: <before> -> <after>
- Changes:
- Risks:
- Scope:

B) Streamline
- Steps: N -> Y
- Code complexity: <before> -> <after>
- Changes:
- Risks:
- Scope:

C) Reframe
- Steps: N -> Z
- Code complexity: <before> -> <after>
- Changes:
- Risks:
- Scope:

Recommended: <A|B|C|D> because ...

Context questions (1-3 if needed):
1) ...
2) ...

Decision required:
Which option should I implement?
```

---

## Boundaries

- Do not run repo-wide hotspot discovery unless user asks.
- Do not convert this into a full architecture migration exercise.
- Do not optimize for metrics first; optimize for fewer steps and clearer flow.
- If simplification conflicts with security/compliance requirements, keep the requirement and simplify around it.
- By default, challenge a feature through both Flow Mode and Code Mode in the same pass.

**Next:** After Phase 7 + user test → **`validate`** (when shipping) → **`finish`** when the user wants a commit. Vague improve entry → **`improve`**; industry should/how → **`standards-align`**; repo-wide patterns → **`consolidate`**; hotspot polish → **`optimize2`**.
