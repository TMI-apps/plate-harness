---
name: hypothesis-debugging
description: >-
  Debug by pre-registered hypothesis instead of guess-and-patch. Before touching
  code, the agent states the suspected root cause, predicts what a successful fix
  proves, and pre-registers what a FAILED fix would teach. IF the user invokes
  hypothesis mode OR naive fixes already failed ≥1 THEN use this skill; ELSE use
  `debug` (router tiebreaks § debug vs hypothesis). Especially for non-obvious, intermittent,
  or repeatedly failed bugs.
---

# Hypothesis Debugging

The aim is not to fix the bug this turn. The aim is to shrink the set of possible causes every turn, so the bug has nowhere left to hide. A fix that lands is a bonus. A fix that fails is data — but only if you said in advance what its failure would mean.

## Core idea

Cheap superficial patches are bad experiments. If you patch a symptom and it doesn't work, you've only crossed out that one patch. You learned almost nothing. If you aim at the ROOT cause and it doesn't work, you've eliminated a whole region of the possibility space — that's a strong experiment that teaches a lot.

So: prefer the hypothesis that, whether confirmed OR refuted, kills the most candidate causes. Spend your one experiment well.

## The procedure

Every iteration, before editing any code, write out the block below. Fill all five fields. Keep the language terse and direct — short phrases, no hedging, no filler. Caveman to-the-point-ness: "Bug in cache, not DB. Fix: clear cache on write." not "It seems plausible that the issue might possibly be related to the caching layer."

Output exactly this, in a single code block:

```
HYPOTHESIS: <what you think the root cause is. one or two lines.>
ROOT-LEVEL CHECK: <why this is a root cause, not a symptom patch. if it IS just a patch, say so and reconsider.>
FIX: <the change you will make to test it.>
IF PROVED: <what a working fix confirms. what region of causes it locks in.>
IF DISPROVED: <what a FAILED fix teaches. which candidate causes it eliminates. how it tightens the probability space. then: NEXT — the recommended next hypothesis to test, chosen from what survives.>
```

Then implement the fix and test it.

## Rules that make this work

**Pre-register before implementing.** Write the whole block first. The "IF DISPROVED" prediction must exist before you run the fix — otherwise it's post-hoc rationalization and worth nothing. A pre-registered failure is information; a story told after the fact is not.

**Aim at root level.** Before committing to a FIX, sanity-check it on the ROOT-LEVEL CHECK line. If the fix only suppresses the symptom, a failure will teach you nothing and a success may mask the real bug. Go deeper. Ask what would have to be true upstream for this symptom to appear.

**On disproof, recommend the next loop — don't stop and don't fix blind.** When the fix fails, the IF DISPROVED line already named what's eliminated and what to test next. Open the next iteration with a fresh block built on the narrowed space. Each loop should have fewer suspects than the last.

**Track what's been ruled out.** Carry a running tally across iterations so the space visibly shrinks:

```
RULED OUT: <causes eliminated so far>
STILL OPEN: <causes still in play>
```

If STILL OPEN isn't shrinking, your hypotheses are too shallow — you're patching symptoms. Go deeper.

## Worked example

Bug: API returns stale user data after an update.

Iteration 1:
```
HYPOTHESIS: Read path hits cache, never invalidated on write.
ROOT-LEVEL CHECK: Root. If write doesn't bust cache, every read is stale regardless of DB state.
FIX: Invalidate user cache key inside the update handler.
IF PROVED: Cause is in cache invalidation. DB writes were fine all along.
IF DISPROVED: Cache invalidation is NOT the cause — eliminates the whole cache-write region. Means either the write never reaches DB, or reads bypass the path I patched. NEXT: assert the DB row actually changes post-write (query DB directly).
```

Fix fails. Data still stale.

Iteration 2:
```
RULED OUT: Cache invalidation on write.
STILL OPEN: Write never persists to DB; read path reads from elsewhere.
HYPOTHESIS: Update handler swallows the write — transaction never commits.
ROOT-LEVEL CHECK: Root. No commit = no persisted change = stale read by definition.
FIX: Log/inspect transaction commit; add explicit commit if missing.
IF PROVED: Cause is the uncommitted transaction. Cache was a red herring.
IF DISPROVED: Write DOES persist — eliminates the entire write-side. Forces cause onto the read side: wrong replica, wrong key, second cache layer. NEXT: query the DB row directly, confirm new value, then trace which source the read actually returns.
```

Each failure cuts the space roughly in half. That's the point.

## When NOT to over-apply

For a one-line obvious typo or a clear stack trace pointing at a single line, just fix it — don't ceremony it up. This skill earns its keep when the cause is genuinely unclear or naive fixes have already failed.

## Boundaries

| Not `hypothesis` | Use instead |
|------------------|-------------|
| Default runtime incident (first pass) | `.agents/skills/debug/SKILL.md` |
| Obvious one-line fix | Fix directly |
| Persist reusable bug class | `.agents/skills/debug/patterns.md` via `finish` or `learn` |

**Router tiebreak:** `.agents/skills/router/references/tiebreaks.md` § `debug` vs `hypothesis`.
