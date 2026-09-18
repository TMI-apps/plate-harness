# Warrant rubric (consolidate)

**When to use:** User asks what would warrant consolidation, asks for a rubric, or an audit is scoring candidates. **SSOT for go/no-go.** Scoring in `SKILL.md` Phase 4 must match this file.

Never invent a parallel chat-only rubric. Read this file, then score.

---

## Wrong tool (do not score as consolidate)

| Symptom | Use instead |
|---------|-------------|
| One feature bloated / too many paths | `challenge` |
| One function slow or too complex | `optimize2` |
| Code in wrong layer/feature | Semantic placement mode (after lint/structure green) |
| Request would add a flag / parallel path / “for now” | `layer-consistency-check` |
| Two similar functions, third not proven | Keep copies (Rule of Three) |

Consolidate = **cross-file / cross-feature same concern**, not “make this file prettier.” **Focus** = Target ∪ 1-hop import neighborhood. **Frequency / gates** count **all** same-pattern hits from the `src/` sweep (including out-of-focus). Execute only in-focus files unless the user expands Target.

---

## Hard gates (any fail → do not consolidate)

Always apply before scoring.

1. **Same job** for the same user journey — not coincidental similar code. If product intent is unclear, ask; do not merge.
2. **3+ real call sites.** Exceptions only (document why): wrong layer even if one use; extract required for tests; cognitive >25 **and** cyclomatic >15 **and** >150 lines. Full exceptions: `optimize2` § Rule of Three.
3. **Indirection still cheaper:** trace the feature in ≤5 files; shared code deletes more than it adds; a newcomer reads the share faster than the copies.
4. **<5 knobs.** More flags means gluing different things. Keep copies or write a convention; do not build a factory.
5. **Home is a real shared layer** (`shared/utils`, `components/common`, `lib`) — not a new coupling between independent features.
6. **Lowest-cost fix first:** accept duplication → document a pattern → extract a util → parameterized hook/component. Never jump to a configurable factory.

---

## Score (after all gates pass)

Score each factor **0–2**, where **2 always means good for sharing**.

| Factor | 0 | 1 | 2 |
|--------|---|---|---|
| **Frequency** | 2 sites (sweep-wide) | 3–4 | 5+ |
| **Stability** | Still changing fast | Some churn | Settled |
| **Simplicity** | Needs a heavy abstraction | Parameterized util | Move + reimport |
| **Sameness** | Will evolve apart | Might | Same concern |
| **SharedBoundary** | Would couple unrelated features | Some coupling | Already a natural share |

```
Score = 2×Frequency + 2×Stability + 2×Simplicity + 3×Sameness + 2×SharedBoundary
```

Range **0–22**. Sameness is weighted highest.

**Never** use `Score = … − (Divergence × 3) − (Coupling × 2)` while also treating Divergence/Coupling **2** as “good for consolidation.” That formula inverts the table and ranks the best candidates as weak.

**Boosters** (gates already passed):

- Bug in one copy, not others: **+3**
- Same product change blocked across N files: **+2**
- Critical user path: **+1**

| Score | Verdict |
|-------|---------|
| **≥12** | Strong — consolidate. |
| **8–11** | Moderate — share only if extraction is simple; else document the pattern. |
| **≤7** | Weak — keep copies; mark as intentional if asked. |

Practical shortcut: **≥3 sites, same concern, stable, simple extract, natural shared home** → consolidate. **Will diverge, or needs a flag forest** → keep duplication.

---

## Do-not list (false warrants)

- “We might need this elsewhere later”
- Two similar functions and no third
- God `utils` / `helpers` file growing
- Passthrough wrappers, single-implementer interfaces/base classes
- Big-bang migrate of every consumer
- Forcing variants into one abstraction with mode flags
- Lint/structure already green but a file “feels messy” inside one feature
