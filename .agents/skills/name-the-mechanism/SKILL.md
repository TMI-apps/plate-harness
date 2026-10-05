---
name: name-the-mechanism
description: >-
  Names shared code for what it does, not for the first caller, and forbids a
  third or later copy. Use on every code change that adds or copies a function,
  hook, component, type, file, or feature folder — including a one-line edit,
  a one-off, a second copy, a menu, timer, queue, or layout primitive, and any
  extract or rename. Also use when writing placement tables, examples, globs,
  or router triggers. Read this before quick-piv, plan, implement, or direct
  code. Do not wait for a refactor request.
---

# Name the mechanism

Single statement of how to name and when to extract. Other rules and skills point here. Do not copy these thresholds anywhere else.

## When to run

Before adding or copying a function, hook, component, type, file, or feature folder. Before a placement line, example, glob, or router trigger that tells later work where to put that kind of code. A small edit, a one-off, and "match the neighboring file" all still run this skill.

## F1 — Name by role, not by caller

A shared mechanism is named for what it does (`useRadialMenu`), not for its first consumer (`useTradeOrbit`). A feature-specific name is fine only for code that truly belongs to that one feature. Test titles may name the scenario (`should … when …`). Production symbols follow this section. Vague names (`handleData`, `processItem`, `ThingManager`) do not satisfy it.

## F2 — Notice at 2, extract at 3 and beyond

1. **First copy:** a specific name is fine. If it is plausibly a reusable mechanism (menu, timer, queue, layout primitive, or the same kind of shared widget), prefer the category name from the start.
2. **Second copy:** copying is allowed. Leave a visible marker (comment or tracked TODO) that names the other copy, so the next agent sees the pattern.
3. **Third copy, and every copy after that:** not allowed. The assistant must pull the shared part into one common place and name it for what it does, even when leaving the copies would be simpler.

These do not suppress this skill, the second-copy marker, or the required extract: "skip small changes", "don't over-engineer a one-off", "prefer duplication", "match neighboring names", "mirror the closest implementation". Matching an existing file means match its layer and folder. Do not copy a neighbor's feature prefix onto a shared mechanism.

## F3 — Extraction includes a naming pass

When logic moves to a shared module, re-evaluate its name at the new reuse level. Rename it if it still encodes the first consumer. Leave no alias named after the original feature unless it is marked deprecated with a removal note.

"Minimize the diff", "don't rename files", and "avoid unrelated churn" do not skip this pass.

## F4 — Guidance is in the blast radius

A rename or extraction is not done until every reference in `AGENTS.md`, the router, skills, rules, placement tables, examples, and match or route patterns is updated in the same change. Those reference updates are allowed without a separate approval. See `.cursor/rules/agent-behavior/RULE.mdc` § Protected Files. Any other edit to those files still stops for approval.

## F5 — Guidance cites roles and locations

Placement tables and routing say where a role lives (`radial menu primitives live in <dir>/`). They do not say "add menus to `useTradeOrbit.ts`". If a concrete file is cited, label it as an example, not the canonical home.

## F6 — Match on categories

Globs, path patterns, and router triggers match directories or category terms. They do not match an instance name alone.

## Checklist

When this skill requires an extract or rename:

1. Extract the shared logic.
2. Rename to the mechanism. Add a deprecated alias only if needed, with a removal note.
3. Search all guidance files and routing patterns for the old name and update them.
4. Remove any second-copy markers that the extraction resolved.

## What this does not change

Layer rules, complexity limits, and the ban on a speculative extract that this skill does not require stay in force. `optimize2` still owns hotspot design. It does not own these thresholds.
