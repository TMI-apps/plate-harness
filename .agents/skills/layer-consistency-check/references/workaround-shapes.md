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
| 5 | **Instance-encoded naming** | A name that encodes the current request (`BreadBuyButton` is an example of the wrong shape, not a required replacement). Rule: `.agents/skills/name-the-mechanism/SKILL.md`. Do not restate it. |
| 6 | **Growing diff** | Scope keeps expanding into files/areas the original request never mentioned, because each fix reveals another place that assumed the old invariant. Your edit footprint has meaningfully exceeded your original estimate. |
| 7 | **The "for now" comment** | `// TODO: hacky, revisit`, `# temporary`, or the internal thought "we'll clean this up later." This is a confession, not a description — treat it as a full trigger, not a note. |

## Severity filter

**Shape #5 first.** Do not use the one-off skip for a new or copied function, component, type, file, or feature folder, or for a second copy that lacks its marker. Apply `.agents/skills/name-the-mechanism/SKILL.md`. Do not restate it.

For every other shape, flag when there is a clear structural alternative worth considering — a plausible sibling case, a workaround that would need to be remembered again later, or a correct version that is not dramatically more expensive now. Do not flag a genuinely one-off exception that will never recur and costs nothing to leave as-is. When in doubt on those other shapes, do the one-beat layer check from the request-side cues before deciding whether it clears the bar.
