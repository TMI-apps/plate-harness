---
name: dont-reinvent-the-wheel
description: >-
  Use this skill whenever you're planning or about to implement a nontrivial piece of
  functionality, before writing the first line of custom code, to check whether a
  well-maintained package or a real-world code pattern is worth reusing instead of
  building it from scratch. Trigger this any time a planned task is substantial enough
  that building it yourself would take real effort AND it isn't already certain the
  project's current dependencies cover it — things like authentication, payment or
  webhook handling, file/format parsing, queueing, rate limiting, data validation,
  protocol clients, caching strategies, or any "someone has definitely solved this
  before" subsystem. Works for any language or stack. Do not trigger for small,
  bespoke, or business-logic-specific code that is inherently unique to this app —
  the whole point is to skip the check when there's nothing generic to find.
disable-model-invocation: false
---

# Don't Reinvent the Wheel

Before sinking real effort into building something from scratch, check whether it's already been solved well — either as a package worth depending on, or as a pattern worth modeling your own code on. Skipping this step is how teams end up maintaining a half-working homebrew auth system nobody wanted to own.

The single biggest way this check goes wrong isn't failing to search — it's stopping at the first plausible-looking result. A repo with a lot of stars and a nice README isn't the same as a well-maintained, well-fitting solution; it might be abandoned, superseded, or simply popular for reasons that don't apply here. Likewise, don't lean on your own memory of "the popular library for X" without verifying it live — that memory can be stale, and newer or better options may exist now. Everything below exists to counter those two failure modes: premature anchoring, and stale recall.

## Integration (this repo)

Procedure below is the SSOT. Callers **link and run** it — they do not copy Steps 0–5.

| Caller | When |
|--------|------|
| [`plan`](../plan/SKILL.md) § Investigate | After the internal reuse search, before locking a custom/greenfield build |
| [`feature`](../feature/SKILL.md) § 3.1a | Before § 3.1b `pattern-review` |
| [`implement`](../implement/SKILL.md) / [`quick-piv`](../quick-piv/SKILL.md) | Catch: Step 1 still true **and** the plan (or chat quick-plan) has no reuse rec yet |
| Always-on reminder | `architecture/RULE.mdc` § Don't reinvent the wheel |

**Order when several apply:** this skill (reuse vs custom) → [`api-integrate`](../api-integrate/SKILL.md) if still researching a vendor contract → [`pattern-review`](../pattern-review/SKILL.md) on the chosen approach (M/L or new contracts).

**Persist:** compact recommendation in `DEVELOPMENT_PLAN.md` § Conflict & compliance (reuse / packages). If license or coupling is a product fork, log it in `DECISIONS.md` via [`plan-grill`](../plan-grill/SKILL.md). This skill still **stops at the recommendation** — no install, no adapted code.

## Step 0: Check what's already there

Before looking outward at all, check whether this project already has the answer:

- Read the manifest (`package.json`, `requirements.txt`/`pyproject.toml`, `go.mod`, `Cargo.toml`, `Gemfile`, etc.) for a dependency that already covers this.
- Skim the codebase for an existing internal utility or module that does this or most of it.

If something already there covers it, that's the end of this skill's job — use what exists, don't add a new dependency or go searching externally to replace something that already works.

## Step 1: Decide if this is actually worth a search

Only continue past this point if **both** are true:

- Building this from scratch would be real, nontrivial effort — not a function you'd bang out in ten minutes.
- It's genuinely unclear whether something already available (in current dependencies, or in the language's own standard library) handles it well.

Good candidates: auth flows, payment/webhook integrations, parsers for known file or protocol formats, rate limiters, job queues, non-trivial data structures or algorithms (LRU caches, diffing, CRDTs), protocol/API clients, UI components with real interaction complexity (rich text editors, virtualized lists, drag-and-drop).

Bad candidates: business logic specific to this product, thin one-off wrappers, anything where adopting a dependency would cost more than just writing the 20 lines yourself. If it's genuinely bespoke, skip this whole process and just build it — forcing a reuse search onto business-specific code wastes time and usually turns up nothing useful.

## Step 2: Search broadly — don't anchor on the first hit

Use whatever live search tools are available in the moment — web search, GitHub's own search (via `gh` CLI/API if available, or fetch/browse otherwise), the relevant package registry for this stack (npm, PyPI, crates.io, Maven, RubyGems, Go's module index, etc.), curated "awesome-x" lists, or the framework/language's own docs recommending a solution. None of these are prescriptive — search wherever the actual answer is likely to live for this stack, and don't hesitate to use a tool or source not listed here if it's a better fit; this list is a starting point, not a ceiling.

Try more than one angle before settling: a specific query if you already suspect a name, a generic descriptive query if you don't, and a check of what the ecosystem's own documentation or community consensus points to. Two or three different searches surface a meaningfully different (and usually better) set of candidates than one.

## Step 3: Shortlist 2-3 real candidates and skim them

For each candidate, look past the surface metrics:

- **Maintenance signal**: last commit/release date, open issue and PR velocity, whether it's marked archived or has a clear "unmaintained" note.
- **Trust signal beyond stars**: is it referenced by the ecosystem's own official docs, a widely-trusted curated list, or independently by more than one source — not just popular in isolation.
- **A real skim of the thing itself**: readable code, a sane API, evidence of tests — not just a good README.
- **Footprint**: how many transitive dependencies it drags in and how much surface area it adds, relative to the problem it solves.

For a package candidate, also check its registry listing (download trend, any maintenance-status flag the registry itself shows).

For a pattern candidate (nothing packages cleanly, but a specific implementation is worth modeling code on), identify and actually open a specific real implementation — don't recommend "I recall project X does this" without verifying it live, since that's exactly the stale-recall failure mode this skill exists to avoid.

## Step 4: Check license fit against *this* project

Look at what this project's own posture actually is — its `LICENSE` file, or the license field in its manifest. If it's closed/proprietary, treat a copyleft license on a candidate (GPL, AGPL, etc.) as a real cost to weigh, not a footnote. If the project is itself open source, check compatibility normally instead. Don't assume a blanket policy across every project — infer it from the project actually in front of you, and say plainly when you're not sure.

## Step 5: Present the recommendation, then stop

This skill's job ends at a clear, honest recommendation — it does not install anything or write adapted code into the project. That decision belongs to whatever planning step comes next.

- If one candidate is clearly better on the criteria that matter here (license fits, well maintained, obviously the right fit), just say so plainly with a short reason. Don't manufacture false alternatives for the sake of a shortlist.
- Otherwise, give a compact ranked shortlist (2-3) framed around what each option **wins** and what it **costs** — make the trade-off visible at a glance rather than burying it in prose.
- Keep "build it ourselves" in view as the implicit baseline: if every candidate's costs are close to or outweigh its benefits, say that plainly instead of forcing a pick.
- For a pattern-based recommendation, describe the approach in prose and link to the specific source (repo + file/path) — don't paste code into the recommendation. Pull the actual code later, only if the plan proceeds with it.
- Keep the whole write-up tight: a short paragraph or a few lines per candidate. This is meant to save planning time, not turn into its own research report.

### Example shape (single clear winner)

> Checked for existing coverage: no queue library in `package.json`, no internal implementation. This is worth a proper job queue rather than hand-rolling one.
> **Recommend: BullMQ.** Actively maintained (weekly releases), the de facto standard for Redis-backed queues in Node, MIT-licensed (no conflict with this project), and the API skim shows solid TypeScript support and retry/backoff built in — would take real effort to replicate correctly ourselves (visibility windows, retry logic, stalled-job recovery).

### Example shape (real trade-off, no forced winner)

> Checked for existing coverage: nothing in `requirements.txt` or the codebase handles PDF text extraction.
> Two solid options, no clean winner:
> - **pypdf** — wins: pure Python, no system dependency, MIT license, active maintenance. Costs: weaker text-layout fidelity on complex PDFs.
> - **PyMuPDF (fitz)** — wins: much better extraction fidelity, actively maintained. Costs: AGPL-licensed (this project is closed-source — worth a real look before adopting), plus a compiled system dependency.
> If layout fidelity matters for this feature, PyMuPDF is worth the license conversation. If not, pypdf is the lower-friction pick.

## What this skill deliberately doesn't do

- It doesn't search other private/internal repos beyond the current project — only this project's own dependencies and code, then public sources.
- It doesn't install packages or write integration code — it stops at the recommendation.
- It doesn't apply one fixed license policy across every project — it reads the actual project's posture each time.

| Concern | Use instead |
|---------|-------------|
| Industry / product *design* fit (is this how products usually do X?) | [`pattern-review`](../pattern-review/SKILL.md) |
| Vendor API contract / MCP / wire shape | [`api-integrate`](../api-integrate/SKILL.md) |
| Internal layer / workaround vs structural path | [`layer-consistency-check`](../layer-consistency-check/SKILL.md) |
| Repo rule compliance | [`validate`](../validate/SKILL.md) |

## Related

- [`plan`](../plan/SKILL.md) — primary Investigate call site
- [`router` tiebreaks](../router/references/tiebreaks.md) § `dont-reinvent-the-wheel` vs `pattern-review` vs `api-integrate`
- [`documentation/DOC_AGENT_WORKFLOW_LAYERS.md`](../../../documentation/DOC_AGENT_WORKFLOW_LAYERS.md) § Don't reinvent the wheel
