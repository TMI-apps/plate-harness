---
name: review
description: >-
  Scores a TypeScript + MUI component against a structured quality rubric (0–5 per item).
  Use when reviewing a specific component for UX, architecture, and maintainability. Not
  repo-rule audits (validate) or development-plan critique (review-dev-plan).
---

# review

Fill in this rubric to review a component in your TypeScript + MUI full-stack app.

## Scoring Guide

Score each item from 0–5:

| Score | Meaning |
|-------|---------|
| 0 | Not addressed / very poor |
| 1 | Weak |
| 2 | Acceptable (but needs improvement) |
| 3 | Good |
| 4 | Very good |
| 5 | Excellent |

At the end, sum the points and compute a percentage.

---

## Section A – API & Props (max 25)

**A1. Prop naming and intent (0–5)**
- Names are clear, specific, and follow common React/MUI conventions (value, onChange, open, variant, etc.)
- No confusing abbreviations or "magic" props

**A2. Required vs optional & defaults (0–5)**
- Truly required props are marked required in TypeScript
- Optional props have sensible defaults
- Component behaves predictably if optional props are omitted

**A3. TypeScript typing quality (0–5)**
- Props interface is explicit and exported
- Complex values (e.g., options, enums) are strongly typed
- No unnecessary `any` or overly broad types

**A4. Composability and flexibility (0–5)**
- Supports standard MUI patterns: className, sx, style, and ...rest when appropriate
- Designed to compose with other MUI components (e.g., can be placed into Grid, Stack, Box easily)

**A5. API surface size & simplicity (0–5)**
- No unnecessary props
- Common use case is easy to achieve with minimal configuration
- Advanced use cases still possible without overcomplicating the basic API

---

## Section B – UI/UX & MUI Consistency (max 25)

**B1. Visual consistency with theme (0–5)**
- Uses theme-based values via sx, theme, or styled
- Colors, typography, spacing, and radius match the design system
- No hard-coded arbitrary styles where theme tokens exist

**B2. Layout & responsiveness (0–5)**
- Works well on desktop; layout doesn't break on common desktop widths
- Degrades reasonably on mobile/tablet (no overflow, unusable controls)
- Uses MUI responsive APIs (sx with breakpoints, Grid, Stack) where appropriate

**B3. Interactive states & feedback (0–5)**
- Clear visual feedback for hover, active, disabled, error, loading, success
- Loading indicators and skeletons/spinners where needed
- Error messages are visible and understandable

**B4. UX clarity (0–5)**
- Component behavior is intuitive, matches user expectations
- Labels, helper texts, and tooltips are clear and concise
- Empty states are handled (not just a blank area)

**B5. Use of MUI components & patterns (0–5)**
- Prefers MUI primitives and patterns over custom ad-hoc HTML + CSS
- Uses appropriate MUI components (Button, TextField, Dialog, Table, DataGrid, etc.) instead of reinventing them

---

## Section C – Accessibility (max 20)

**C1. Semantic structure (0–5)**
- Uses correct underlying elements (buttons are `<button>`, headings use `<h*>`, lists use `<ul>`/`<li>`, etc.)
- Custom components preserve semantics (e.g., `component="button"` when using Box or Typography interactively)

**C2. Keyboard navigation (0–5)**
- All interactive elements are reachable with Tab / Shift+Tab
- Keyboard interaction makes sense (e.g., Enter/Space to activate buttons, Esc to close dialogs)
- Focus is not trapped or lost unexpectedly

**C3. Focus management & visibility (0–5)**
- Focus ring is visible and not removed without replacement
- For overlays/dialogs/menus, initial focus is handled sensibly, and focus returns to trigger when closed

**C4. ARIA usage & labelling (0–5)**
- Uses ARIA attributes where needed (for complex widgets) but not overused
- Inputs and controls have accessible labels
- Error and helper text are associated with the relevant elements

---

## Section D – Performance (max 15)

**D1. Rendering efficiency (0–5)**
- No obvious unnecessary re-renders (e.g., stable props where possible, React.memo or memoized values if needed)
- Avoids creating new inline objects/functions in hot paths without reason

**D2. Handling of large data/complex UI (0–5)**
- For components that render lists/tables, uses pagination, virtualization, or chunking where appropriate
- No heavy synchronous work in render that blocks the UI

**D3. External dependencies & bundle impact (0–5)**
- Avoids adding large dependencies for trivial features
- Uses tree-shakable imports (e.g., importing only needed icons/components)
- No obviously redundant libraries

---

## Section E – State, Data & Backend Integration (max 20)

**E1. Separation of concerns (0–5)**
- UI concerns (presentation) are separated from data fetching and business logic when reasonable
- Component is not tightly coupled to specific endpoints if it should be reusable

**E2. Async states (loading, error, empty) (0–5)**
- Handles loading, error, and empty states explicitly and visibly
- Async operations don't leave the UI stuck or ambiguous
- Failures are communicated in a user-friendly way

**E3. Validation & business rules (0–5)**
- Basic client-side validation is present where necessary
- Server-side errors are surfaced clearly (e.g., field errors vs general error)
- Validation logic is predictable and consistent across similar components

**E4. Data flow & side effects (0–5)**
- Props, callbacks, and context usage make data flow understandable
- Side effects are handled in appropriate hooks (useEffect, custom hooks) and not scattered across render logic

---

## Section F – Code Quality & Structure (max 20)

**F1. File structure & component size (0–5)**
- File is not excessively large; complex logic is split into smaller components or hooks
- Follows project structure conventions (see `.cursor/rules/architecture/RULE.mdc` and `documentation/PROJECT-STRUCTURE-VALIDATION.md` for SSOT)

**F2. Readability & style (0–5)**
- Code is easy to read: consistent formatting, clear variable names, minimal nesting
- No dead code, commented-out blocks, or debug logs left behind

**F3. Reuse and duplication (0–5)**
- No obvious copy-paste duplication with other components
- Shared logic is extracted (to hooks/helpers) when it appears in multiple places

**F4. Complexity metrics (0–5)**
- Meets complexity standards (see `.cursor/rules/code-style/RULE.mdc` for SSOT - complexity thresholds defined in `eslint.config.js` (complexity rules))
- Cyclomatic complexity ≤ 10, cognitive complexity ≤ 15, nesting ≤ 4, function length ≤ 100 lines, parameters ≤ 5

---

## Section G – Documentation & Usage Examples (max 10)

**G1. In-code documentation (0–5)**
- Component has a short description in a comment or JSDoc if non-trivial
- Complex props or behaviors are documented near their definitions

**G2. Usage examples / stories (0–5)**
- There is at least one example or Storybook story showing typical usage
- If the component is part of a shared library, usage is discoverable by other devs

**Documentation policy note (anti-staleness):**
- Prefer source-adjacent comments/tests/examples over creating new standalone narrative docs
- New deep docs are optional and should only be added with explicit user approval

---

## Section H – Requirements & Integration (max 20)

**H1. Requirements match (0–5)**
- Implementation matches the original user stories/requirements
- No scope creep or missing features
- Edge cases from requirements are handled
- Acceptance criteria from planning phase are met

**H2. Tech stack fit (0–5)**
- Uses patterns consistent with the rest of the codebase
- Follows architectural standards (see `.cursor/rules/architecture/RULE.mdc` for SSOT)
- Doesn't introduce conflicting patterns or approaches

**H3. Integration & regression (0–5)**
- Component doesn't break existing functionality
- Integrates correctly with adjacent features
- No unintended side effects on other components
- Import/export structure is clean

**H4. Security & authorization (0–5)**
- Sensitive data is handled appropriately (not logged, not exposed)
- Auth checks are in place where needed
- No exposed secrets, tokens, or vulnerabilities
- User permissions are respected in the UI

---

## Section I – Testing & Validation (max 15)

**I1. Test coverage (0–5)**
- Unit tests exist for key logic and edge cases
- Tests are meaningful, not just coverage padding
- Critical paths are tested

**I2. Manual testing done (0–5)**
- Feature was manually tested in the browser
- Happy path verified
- Error states and edge cases verified

**I3. Type safety (0–5)**
- No TypeScript errors (`npm run type-check` passes)
- No `@ts-ignore` or `@ts-expect-error` without justification
- Types are specific, not `any` or `unknown` without reason

---

## Summary Template

Use this per component:

| Section | Score | Max |
|---------|-------|-----|
| A – API & Props | /25 | 25 |
| B – UI/UX & MUI Consistency | /25 | 25 |
| C – Accessibility | /20 | 20 |
| D – Performance | /15 | 15 |
| E – State & Backend Integration | /20 | 20 |
| F – Code Quality & Structure | /20 | 20 |
| G – Documentation & Examples | /10 | 10 |
| H – Requirements & Integration | /20 | 20 |
| I – Testing & Validation | /15 | 15 |
| **Total** | **/170** | **170** |

**Overall score (%) = (Total / 170) × 100**

---

## Score Thresholds

| Score | Status |
|-------|--------|
| 90–100% | Production-ready |
| 75–89% | Usable, but has clear improvement points |
| 60–74% | Needs work before reuse in library |
| <60% | Rework before using in real features |

---

## Quick Checklist (for fast reviews)

Before detailed scoring, quick-check these critical items:

- [ ] **Requirements met?** (H1)
- [ ] **No broken functionality?** (H3)
- [ ] **Type-check passes?** (I3)
- [ ] **Lint passes?** (F2)
- [ ] **Tested manually?** (I2)
- [ ] **Complexity acceptable?** (F4)
- [ ] **Accessible?** (C1-C4)
- [ ] **Secure?** (H4)

If any critical item fails, address before detailed review.

**Next:** Fixes → **`quick-piv`** or **`implement`**; before merge → **`validate`**; ship → **`finish`**.
