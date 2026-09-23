---
name: feature
description: >-
  Runs systematic new-feature engineering with mandatory decision stops; produces product/requirements
  artifacts, not DEVELOPMENT_PLAN.md (plan is SSOT for execution plans). Use for new feature
  requests before planning. Not implement, validate, or finish.
---

# feature

Systematic engineering process for new feature requests. **Primary outcome:** product/requirements artifact with mandatory 🔴 decision stops — **not** the durable execution plan (`DEVELOPMENT_PLAN.md` is **`plan`** SSOT).

Follow phases sequentially. 

**CRITICAL: At every 🔴 DECISION POINT, you MUST:**
1. **STOP** all coding/implementation activities
2. Present the question/decision clearly to the user
3. **WAIT** for explicit user response before proceeding
4. Document the user's answer in the implementation document
5. Do NOT proceed to next phase until user confirms

**Violating decision points is a critical failure.**

---

## Phase 1: Pre-Development Analysis

### 1.0 App vision (product SSOT)

- [ ] Read `documentation/DOC_APP_VISION.md`. If vision status is **`DRAFT`**, **STOP** and direct the user to fill it (see `.agents/skills/start/SKILL.md` § App vision) or obtain explicit written deferral before Phase 1 coding. Feature specs must not invent product scope when this file is empty of real prose.

### 1.1 Branch & Workflow Check
- [ ] Read `src/config/git-workflow.json`. Apply `.cursor/rules/git-workflow/RULE.mdc` § Mode-aware branch gate before app-code work.

### 1.2 Rule Decision Tree
Check each rule category systematically:

**Backend/Secrets?**
- YES → Check `cloud-functions/RULE.mdc` (decision framework: security, secrets, testability)
- NO → Skip

**Database changes?**
- YES → Check `database/RULE.mdc` (migration patterns: idempotent, IF EXISTS, safe for fresh/existing DBs)
- NO → Skip

**File placement?**
- Check `file-placement/RULE.mdc` → `architecture/RULE.mdc`
- Determine location BEFORE creating files

**Code structure?**
- Check `architecture/RULE.mdc` (feature vs shared, layers, import direction, path aliases)

**Security?**
- Check `security/RULE.mdc` (auth, RLS, validation, secrets management)

**Implementation details?**
- Check `code-style/RULE.mdc` (naming, formatting, complexity: ≤10 cyclomatic, ≤15 cognitive, ≤100 lines)

### 1.3 Risk & Impact Assessment
- [ ] Identify breaking changes
- [ ] Assess impact on existing functionality
- [ ] Determine testability (feature-branch preview deploy? Edge functions backup? Database has staging?)
- [ ] Flag high-risk decisions requiring user approval

**🔴 DECISION POINT:** 
- If high-risk identified → **STOP** immediately
- Present risk assessment to user
- Ask: "Should I proceed with this high-risk change?"
- **WAIT** for explicit user confirmation (yes/no)
- Document user's decision before proceeding

---

## Phase 2: Requirements & Design

### 2.0 Ambiguity Elimination Gate
- [ ] Identify every ambiguous product, UX, data, role, and workflow choice before planning implementation.
- [ ] For each ambiguity, ask a question about the user's vision for how the app will be used in real life.
- [ ] Do not choose between plausible interpretations silently.
- [ ] Document each answer in the implementation document.

**🔴 DECISION POINT:**
- If any ambiguity remains → **STOP**
- Ask a specific app-usage or product-vision question that clears the ambiguity
- **WAIT** for explicit user response
- Document the answer before proceeding

### 2.1 User Stories
- [ ] Extract user stories with roles (unauthorized/free/premium/admin)
- [ ] Define acceptance criteria:
  - Happy path
  - Error states & edge cases
  - Loading & empty states
  - Accessibility requirements

### 2.1.1 User Journey & State Transition Mapping (MANDATORY)
**This section MUST be completed before proceeding to Phase 3. Map ALL user states and transitions:**

- [ ] **Initial States:** Document all entry points (unauthenticated, authenticated, anonymous, expired session, etc.)
- [ ] **State Transitions:** Map every possible transition:
  - What triggers each transition?
  - Where does user go after each action?
  - What happens on errors during transitions?
- [ ] **Navigation Flows:** Document complete navigation paths:
  - Entry → Feature → Exit
  - Error recovery paths
  - Back/forward navigation behavior
- [ ] **Edge Cases in User Flow:**
  - What happens if user navigates away mid-action?
  - What happens if session expires during feature use?
  - What happens on logout/logout from different states?
  - What happens if user loses network connectivity?
  - What happens if user refreshes page mid-flow?
- [ ] **Cross-Feature Interactions:** How does this feature interact with:
  - Authentication state changes
  - Other features that might trigger navigation
  - Global state changes (notifications, updates, etc.)

**Format:** Create a state diagram or transition table documenting all states and transitions. Include this in the implementation document.

**🔴 DECISION POINT:** Present the user journey map to user. Confirm completeness before proceeding. Ask: "Are there any user states, transitions, or edge cases missing from this map?"

### 2.2 Existing Functionality Search
**After user stories are defined**, search for existing functionality that could satisfy them:
- [ ] Search for similar functionality (semantic search)
- [ ] Identify reusable components/patterns (API design, state, error handling)
- [ ] Find components that could be abstracted/extended
- [ ] Check if user stories are already (partially) satisfied by existing code
- [ ] Document existing patterns found

### 2.3 Required Information Gathering
Categorize missing info:
- **External:** Database schema, API keys, dependency docs, response formats
- **App context:** Architecture, tech stack, auth patterns, adjacent functionality, state management
- **Design intent:** Only aspects NOT already established in codebase

**🔴 DECISION POINT:** 
- For missing info → Search codebase first
- If no codebase precedent exists, or if the precedent does not clarify intended app usage → **STOP** and ask user
- Format question clearly around app usage and vision: "I need to know [specific thing]. I searched the codebase and found no precedent. For users of this app, should [specific thing] work as [option/interpretation] or differently?"
- **WAIT** for user answer
- Document answer before proceeding

### 2.4 Concrete Implementation Approaches (Progressive Complexity)
Using the existing functionality found in 2.2, present **2-4 concrete approaches** ordered from simplest to most complex. Each approach must include:

- **What changes:** Specific files, components, and functions affected
- **What's new vs modified vs removed:** Scope of the change
- **How it uses existing code:** Which patterns, components, utilities from 2.2
- **Tradeoffs:** Effort, flexibility, maintenance implications
- **Value profile:** Which product value it optimizes first (delivery speed, stability/risk reduction, UX quality, future extensibility, or maintenance cost)

Do NOT use fixed abstract categories (like A/B/C/D labels). Derive each approach from actual codebase analysis. Some features may only have one viable approach; others may have three. Present only approaches that genuinely apply.

Use product-owner language first, technical mapping second:
- Lead with outcome/value framing understandable without coding knowledge
- Then add technical scope details for traceability

**🔴 DECISION POINT:** 
- **STOP** implementation activities
- Present ALL concrete approaches with value profiles
- Ask the user in non-technical terms:
  - "Which value should we optimize for first?"
  - "Choose a primary priority: fastest delivery, lowest regression risk, strongest user experience, easiest future expansion, or lowest maintenance overhead."
- If needed, ask for a secondary priority to break ties
- Map the chosen priority back to the corresponding concrete approach
- **WAIT** for user's explicit choice
- Document chosen priority and mapped approach before proceeding
- If generality is not yet in `DECISIONS.md`: “easiest future expansion” maps to **rewirable** only when a second consumer is named now. Otherwise log a deferred non-goal and keep **instance** or **feature**. SSOT: `plan-grill` § Generality — do not invent a platform from this pick alone.

### 2.5 Decision Point Matrix
Identify **subjective** choices requiring user input.

**Subjective (ASK user):**
- Choices where NO codebase precedent exists
- Business logic decisions (what should happen)
- Feature scope decisions
- New interaction patterns not yet in app
- Risk/complexity tradeoffs
- **User journey decisions** (where users go after actions, error recovery paths)

**Objective (DO NOT ask, follow codebase standards):**
- Choices where codebase standards already exist
- Design system elements (spacing, colors, typography, shadows)
- Component patterns already used in app
- State management patterns already established
- Error handling patterns already established
- File structure and naming conventions

**🔴 DECISION POINT:** 
1. **STOP** and list all subjective choices identified
2. For EACH subjective choice, ask the user explicitly
3. Document user's answers in format:
   ```
   Q: [Question]
   A: [User's answer]
   Decision: [What was decided]
   ```
4. **DO NOT PROCEED** until all subjective choices have user answers documented
5. Verify no unanswered questions remain before moving to Phase 3

---

## Phase 3: Architecture & Structure Planning

### 3.1 Architecture Planning
- [ ] **Feature decomposition self-check (mandatory, no user stop):** Enumerate domain concepts. If >1 cohesive concept, or projected size exceeds `featureBudgets.config.cjs`, split into multiple features before file creation. See `.cursor/rules/architecture/RULE.mdc` § Feature granularity.
- [ ] After the feature folder name is locked: [`.agents/skills/modularity-review/SKILL.md`](../modularity-review/SKILL.md) runs after **implement** creates the folder (`pnpm arch:check` + `pnpm modularity:report`). New features must not import `@mui` / `@supabase` / `airtable` (use nominated ports).
- [ ] Determine feature structure (feature-based vs shared) - `architecture/RULE.mdc`
- [ ] Choose layer placement (components/hooks/services/utils) - `architecture/RULE.mdc`
- [ ] Understand import direction (downward only) - `architecture/RULE.mdc`
- [ ] Select path aliases (@/hooks/*, @/components/*, etc.) - `architecture/RULE.mdc`
- [ ] Decide: feature-specific vs shared code - `architecture/RULE.mdc`

### 3.1a Don't reinvent the wheel (proactive — when applicable)

- [ ] If this feature includes a generic subsystem (auth, webhooks, parsers, queues, protocol clients, complex widgets, …) not obviously covered by current deps, run [`.agents/skills/dont-reinvent-the-wheel/SKILL.md`](../dont-reinvent-the-wheel/SKILL.md) **before** locking a from-scratch design. Skip when the work is bespoke/business-specific.
- [ ] Record the compact rec for the later plan (Conflict & compliance). Do **not** install packages from this step.

### 3.1b Pattern & industry precedent (proactive — when applicable)

- [ ] Run [`.agents/skills/pattern-review/SKILL.md`](../pattern-review/SKILL.md) (`scan` or `lite`) **without waiting for the user to ask** — follow [`references/rubric.md`](../pattern-review/references/rubric.md); **select aspects** relevant to this feature.
- [ ] If material divergence from common industry practice: add **Pattern & precedent** to `DEVELOPMENT_PLAN.md` and post the **Pattern risk** alert in chat.
- [ ] **STOP** at 🔴 DECISION POINT until the owner picks an approach (A/B/C) or waives non-standard design—same as other subjective architecture choices.

### 3.2 Cloud Functions Planning (if backend needed)
- [ ] Use decision framework (`cloud-functions/RULE.mdc`): security, secrets, testability
- [ ] Decide: Edge Function vs frontend logic
- [ ] Organize by business capability if creating functions

### 3.3 Database Planning (if database changes needed)
- [ ] Plan migration patterns (`database/RULE.mdc`): idempotent, safe for fresh/existing DBs
- [ ] Use safe patterns (IF EXISTS, OR REPLACE, etc.)
- [ ] Handle empty tables in data migrations

### 3.4 Security Planning
- [ ] Authentication/authorization requirements (`security/RULE.mdc`)
- [ ] Input validation patterns (`security/RULE.mdc`)
- [ ] RLS policies if database changes (`security/RULE.mdc`)
- [ ] Secrets management if Edge Functions (`security/RULE.mdc`)
- [ ] Rate limiting if Edge Functions (`project-specific/RULE.mdc`)

### 3.5 File Placement Validation
- [ ] Validate against `projectStructure.config.cjs` (run `pnpm validate:structure`)
- [ ] Confirm correct location per `file-placement/RULE.mdc`
- [ ] Check whitelist compliance
- [ ] Determine file locations BEFORE creating

### 3.6 Complexity Projection
- [ ] Estimate cyclomatic complexity (target: ≤10)
- [ ] Estimate cognitive complexity (target: ≤15)
- [ ] Estimate function length (target: ≤100 lines)
- [ ] Estimate parameters (target: ≤5)

**🔴 DECISION POINT:** 
- If projections exceed thresholds → **STOP**
- Present complexity analysis to user
- Ask: "Complexity exceeds thresholds. Should I simplify the design, or proceed with your approval?"
- **WAIT** for user decision
- Document decision before proceeding

### 3.7 Integration Points Analysis
- [ ] Identify integration points with existing code
- [ ] Assess impact on existing functionality
- [ ] Plan backward compatibility if needed
- [ ] Document dependencies

### 3.8 Standards Divergence Check
- [ ] Identify any planned diversion from industry standards, framework best practices, or established repo conventions.
- [ ] Prefer alignment with standards unless the user intentionally wants the diversion.
- [ ] Document each confirmed diversion and its reason.

**🔴 DECISION POINT:**
- If a diversion is found → **STOP**
- Ask: "This plan diverges from [standard/best practice/convention] by [specific diversion]. Is that intentional, or should I align the plan with the standard?"
- **WAIT** for user decision
- Document decision before proceeding

---

## Phase 4: Implementation Plan

**Scope:** Detail the specific approach chosen by the user in 2.4. Every section below must describe what happens under that chosen approach, not generic possibilities.

### 4.1 Component/API Design
- [ ] Leveraged existing functionality (from 2.2)
- [ ] Props interface (types, defaults)
- [ ] Follows existing patterns?
- [ ] Minimal API for common cases, flexible for advanced
- [ ] Composability with existing components

### 4.2 State & Data Flow
- [ ] State location (local/context/store)
- [ ] Async states (loading, error, empty, success)
- [ ] Side effects (API calls, subscriptions, timers)
- [ ] Data flow direction

### 4.3 UI/UX Considerations
- [ ] Layout and placement
- [ ] Responsive strategy (breakpoints)
- [ ] Interactive states (hover, active, disabled, loading, error)
- [ ] Empty and loading states

### 4.4 Accessibility Planning
- [ ] Keyboard interactions (Tab, Enter, Escape, arrows)
- [ ] ARIA attributes
- [ ] Focus management
- [ ] Semantic HTML

### 4.5 Technical Considerations
- [ ] Pseudo-code sketches
- [ ] New components: purpose, location (`file-placement/RULE.mdc`), reusability
- [ ] Performance (rendering, bundle size, lazy loading)
- [ ] Error scenarios and edge cases
- [ ] Dependencies (new needed? existing sufficient?)
- [ ] Integration points
- [ ] Impact on existing functionality

### 4.6 Validation & Testing Plan
- [ ] How to validate correctness
- [ ] Manual/user testing steps (default)
- [ ] Identify if automated tests are warranted (see 6.1 criteria)

### 4.7 Architecture Compliance Check (Plan Validation)
Verify the PLAN complies before implementation:
- [ ] Planned file placements comply with `projectStructure.config.cjs`
- [ ] Planned layer boundaries respect `architecture/RULE.mdc`
- [ ] No planned circular dependencies
- [ ] Planned complexity within thresholds (SSOT: `.eslintrc.json` lines 65-70)
- [ ] No unresolved ambiguity remains
- [ ] Any standards or best-practice divergence is documented with explicit user confirmation

*Note: Actual validation commands run during **`implement`** → **`validate`**, not in this skill.*

**🔴 DECISION POINT:** 
- **STOP** all implementation activities
- Present complete implementation plan summary:
  - User stories and acceptance criteria
  - Chosen approach with concrete scope (from 2.4)
  - User journey map (from 2.1.1)
  - All subjective decisions made (from 2.5)
  - Architecture decisions
  - File structure plan
  - State management approach
- Ask: "Does this implementation plan look correct? Should I proceed with implementation?"
- **WAIT** for explicit user approval ("yes", "proceed", "looks good", etc.)
- **DO NOT START CODING** until user explicitly approves
- Document approval in implementation document

---

## Handoff to engineering delivery (after Phase 4)

When Phases 1–4 are complete and the user approved the implementation plan:

1. Ensure **`documentation/jobs/temp_job_<name>/DECISIONS.md`** holds all product/scope 🔴 outcomes from this run (create/migrate if missing) so `plan` / `plan-grill` do not re-ask.
2. Run **`.agents/skills/plan/SKILL.md`** to produce **`documentation/jobs/temp_job_<name>/DEVELOPMENT_PLAN.md`** (engineering SSOT), **or** confirm that file already exists and matches the approved spec.
3. Satisfy required gates per [dev-cycle matrix](../router/references/dev-cycle-matrix.md): `dont-reinvent-the-wheel` when a generic subsystem is in play; `pattern-review` when M/L; `review-dev-plan` when Complexity M/L; `validate` (plan-review) when warranted.
4. Run **`.agents/skills/implement/SKILL.md`** only after `DEVELOPMENT_PLAN.md` exists — **do not skip `plan`**; **do not implement product code in this skill**.

**Next (execution chain):** `plan` → (gates) → `implement` → **`.agents/skills/validate/SKILL.md`** → user acceptance → **`.agents/skills/finish/SKILL.md`** (changelog/commit only in `finish`).

Phases 5–7 below are **retired** — implementation, QA, and completion live in `implement` → `validate` → `finish`. Do not execute them here.

---

## Key Principles

1. **Simplify First:** Always try to achieve goal by simplifying/removing code before adding
2. **Minimal Changes:** Make as few code changes as necessary
3. **Leverage Existing:** Reuse patterns, components, and logic wherever possible (even for new implementations)
4. **Follow Codebase Standards:** Use existing design patterns without asking user
5. **User Involvement:** 
   - **MANDATORY:** Stop at every 🔴 decision point
   - Present questions clearly and wait for explicit user response
   - Document all user answers before proceeding
   - Never skip decision points or assume answers
   - User journey mapping (2.1.1) is mandatory before implementation
   - Ambiguity must be cleared with app-usage or product-vision questions before planning proceeds
6. **Rule Compliance:** Validate against all `.cursor/rules` systematically
7. **Standards Alignment:** Ask before preserving any diversion from industry standards, framework best practices, or repo conventions
8. **Progressive Complexity:** Offer options from simplest to most complex
9. **Validation:** Never claim success without user testing

---

## Problem This Strategy Alleviates

Prevents: 
- "Assistant adds features without analyzing existing code"
- "Doesn't seek simpler alternatives"
- "Ignores rules"
- "Makes subjective choices without user input"
- "Asks user about things already established in codebase"
- **"Continues coding without stopping at decision points"**
- **"Doesn't map user journeys, causing broken navigation flows"**
- **"Implements features without gathering required user input"**

Ensures: 
- Systematic analysis
- Simplification-first approach
- Leveraging existing functionality even for new implementations
- Following codebase standards automatically
- **Mandatory pausing at all 🔴 decision points**
- **Complete user journey mapping before implementation**
- **Documentation of all user questions and answers**
- User involvement only for truly subjective choices
- Rule compliance
- Minimal code changes
- Comprehensive validation

## Decision Point Enforcement

**Every 🔴 marker means:**
1. **STOP** all coding/implementation immediately
2. Present the question/decision clearly
3. **WAIT** for explicit user response
4. Document the answer
5. **Product / scope / edge answers:** append a **closed** row to `documentation/jobs/temp_job_<name>/DECISIONS.md` (first writer creates job folder + file — format [`../plan-grill/references/decisions-template.md`](../plan-grill/references/decisions-template.md); `source: feature`). Skip pure mechanism/rule-compliance stops that are not product forks.
6. Only then proceed to next step

**Violating this process is a critical failure.** If you find yourself coding past a 🔴 marker without user input, you have made an error.

---

## Boundaries

| Not `feature` | Use instead |
|---------------|-------------|
| Durable phased execution plan | `plan` → `DEVELOPMENT_PLAN.md` |
| Phase-by-phase execution | `implement` (after handoff from Phase 4) |
| Small XS/S scoped change | `quick-piv` |
| Product Q&A when gates 1–2 fail | `grill-me` |
| Product forks during `plan` | `plan-grill` (or `plan-grill-auto` when the user forbids questions) |
| Product decision ledger format | `plan-grill/references/decisions-template.md` (this skill writes rows) |
| Changelog / commit / push | `finish` / `push` |
| Simplify existing feature | `challenge` |
