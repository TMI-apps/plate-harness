# Workaround shapes — detection SSOT

Used by **layer-consistency-check** during proactive and reactive checks. Each shape is detectable from the structure of the change itself, independent of domain.

## Request-side cues (proactive)

Before any code is written. Core reflex: every request carries an assumption about how the system works; the user can't see the implementation, so **verify that assumption before acting**.

- **Behavior change on existing system:** any ask to alter existing behavior — "add a color to the gradient", "make it splash", "add a field/button/flag", tune a param, extend a path. Strongest default trigger; do not wait for soft language.
- **Minimizers:** "just", "simply", "quick", "small tweak", "can we just—"
- **Exception markers:** "only in this case", "for now", "temporarily", "this one level/page/component"
- **First-of-a-kind concreteness:** the request names a specific instance ("bread button", "welcome email") in a system that has no category for it yet
- **Behavior-by-analogy:** "make it do X like [other game/app]" — importing a visible behavior without importing the architecture that produces it

When you see these cues, spend one deliberate beat asking: *what does the user assume this system already does, is that true in the code, what layer does this touch (physics/math, abstraction hierarchy, or architecture), and does the request actually fit inside that layer's constraints?* If yes, proceed normally — this is a cheap check, not a blocker.

### Repo architecture cues (this harness)

- **Disconnected patch — config/onboarding UI:** Request adds page-level connect/configure UI for an optional integration whose SSOT is **off-app** (`.env`, `src/config/app-tasks.json`, README/docs — no in-app setup wizard). Detection: search for existing onboarding path (`app-tasks.json`, README, `start` skill) before adding UI. If SSOT is env/tasks/docs, a one-off product-page button is shape #4 — structural path extends the existing onboarding surface, not a bolt-on component.

## Implementation-side shapes (reactive)

Treat any of these as a stop sign, not friction to push through. Mid-impl trigger: your own code starts to look like a workaround — stop and run the severity filter.

| # | Shape | Cue |
|---|-------|-----|
| 1 | **Special case / exclusion flag** | A conditional whose entire job is to carve an exception out of something previously uniform (`if (thisOneLevel)`, `unless: bread_order`). The condition names a specific instance, not a general property. |
| 2 | **Parallel / duplicate path** | A new function/table/component that's largely a copy of an existing one instead of extending it. You're copy-pasting and tweaking, or thinking "easier to just write a new one." |
| 3 | **Symptom suppression via parameter tuning** | Smaller timestep, more damping, longer timeout, more retries, `!important`, a "long enough" debounce. You can't explain the *mechanism* by which the new value fixes things, only that the symptom went away in your test case. |
| 4 | **Disconnected patch** | The fix lives outside the system it's patching (UI-layer hack for a data-layer problem, a visual effect not actually reading solver state). The new code doesn't share a data source / source of truth with the system it's supposedly part of. |
| 5 | **Instance-encoded naming** | Naming something after the current request rather than the domain category (`BreadBuyButton` vs `BuyButton`). Ask: "if a second instance shows up next month, does this name still make sense unmodified?" If you'd have to rename it, you named the instance. **Greenfield counts** — locking `submitGovernorAttendanceQ1Report` on day one is this shape, not “being descriptive.” Naming SSOT: `code-style/RULE.mdc` § Category, not instance. |
| 6 | **Growing diff** | Scope keeps expanding into files/areas the original request never mentioned, because each fix reveals another place that assumed the old invariant. Your edit footprint has meaningfully exceeded your original estimate. |
| 7 | **The "for now" comment** | `// TODO: hacky, revisit`, `# temporary`, or the internal thought "we'll clean this up later." This is a confession, not a description — treat it as a full trigger, not a note. |

## Severity filter

Not every instance deserves a stop. **Flag when there's a clear structural alternative worth considering** — i.e. a plausible sibling case exists, or the workaround would need to be remembered/excluded again later, or the "correct" version isn't dramatically more expensive to build now.

Don't flag genuinely one-off exceptions that will never recur and cost nothing to leave as-is. **Do not use that skip for shape #5** when introducing a function, component, type, file, or feature folder: one caller today is exactly when a bad name becomes legacy. Rename to the category (or stop for WARNING) instead of encoding the instance. When in doubt on other shapes, do the one-beat layer check from the request-side cues before deciding whether it clears the bar.
