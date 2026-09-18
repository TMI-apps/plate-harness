# Routing fixtures — advisor package

Job: `temp_job_advisor-skill-package`. Phase 3 / Phase 7 check.

Each row is a sentence an advisor would plausibly type. A cold reader holding only the shipped
`description` strings must land on the expected skill. Rows marked **trap** exist to catch two
descriptions competing for the same phrasing.

| # | What the advisor types | Expected | Must NOT fire |
|---|------------------------|----------|---------------|
| 1 | "I need to write something for the governors about attendance but I'm not sure what they actually want" | `refine` | `plan`, `deliver` |
| 2 | "Right, I know what the report needs to say. It's four sections and I've got data from three sources." | `plan` | `refine` |
| 3 | "Let's start on section two." | `deliver` | `plan` |
| 4 | "Is this ready to send to the head?" | `review` | `deliver` |
| 5 | "You've made that same mistake twice now — we never put recommendations before the evidence." | `learn` | `align-harness`, `review` |
| 6 | "Two of these skills seem to do the same thing and I never know which one starts." | `align-harness` | `learn` |
| 7 | "Every time I do a school visit write-up I follow the same five steps. Can that be a skill?" | `create-skill` | `align-harness` |
| 8 | "Which of these should I be using?" / "/router" | `router` | anything else |
| 9 | "Does this induction process really need seven steps?" (**trap** vs `refine`) | `challenge` | `refine` |
| 10 | "Is this how other trusts normally structure a pupil premium statement?" (**trap** vs `review`) | `standards-align` | `review` |
| 11 | "Have we written something like this before?" | `check-what-exists` | `refine` |
| 12 | "This tracking sheet keeps giving numbers the schools don't recognise and I can't work out why." | `root-cause` | `review`, `deliver` |
| 13 | "Can you make this table look right in PowerPoint?" | none of these — built-in document skills | `deliver`, `review` |
| 14 | "Make this better." (**trap** — no target) | `router` (which sends it to `refine`) | `challenge`, `review` |
| 15 | "Retire the old visit-notes skill, we don't use it." (**trap** vs `create-skill`) | `align-harness` | `create-skill` |

## Result log

| Date | Fixtures run | Passed | Notes |
|------|--------------|--------|-------|
| _pending Phase 7_ | | | |
