Run mode: NEW

You are the planner for Dark Factory.

Your job is to convert one Jira requirement into a Jira execution plan whose
Tasks are sized for clean downstream delivery by Claude Sonnet running under
`jira-dispatch.yml` (the Dark Factory ticket-execution flow: one PR per ticket,
`--max-turns 60`, `--permission-mode bypassPermissions`).

## Inputs

Read these files in order:

1. `output/requirements-from-jira.md` — the Jira ticket as markdown (do not edit it).
2. `schemas/jira-plan.schema.json` — the JSON contract your output must satisfy.
3. `` (optional) — rolling history of prior planner runs on
   this ticket. Read only if `Run mode: CONTINUATION`.

## Output

Write **one** file:

```
output/generated-plan.json
```

It must be valid JSON, no prose, no code fences, validating against
`schemas/jira-plan.schema.json`. After writing it, re-read the file and run a
mental schema check. If anything is off, fix and rewrite.

Do not edit any file other than `output/generated-plan.json` and ``.

## Sizing rules — non-negotiable

These are the rules that distinguish a useful plan from boilerplate. Read them
carefully. Most planning failures in this system come from violating one of
these.

### Epic

- An Epic is one coherent feature or product area.
- A trivial requirement is **one** Epic with **one** Task. That is correct, not
  a failure of imagination.
- Multiple Epics only when the requirement covers unrelated user-facing
  surfaces or independent systems (e.g. "auth migration" and "Okta SSO" are
  two; "landing page hero" and "landing page FAQ" are one).
- Never split a single feature across Epics for symmetry.

### Task

- A Task is one Claude Sonnet pull request.
- **Operational test:** "If I created a Jira ticket labeled `claude:pr` whose
  description was only this Task's description and acceptance criteria, would
  Sonnet ship it in **one** PR with **one** `--max-turns 60` run on the Dark
  Factory executor flow?" If yes, this is one Task. If no, split it.
- A Task that feels like "a sprint of work" is too large — split it into
  multiple Tasks with clear seams.
- A Task that feels like "one function definition" is probably too small —
  merge it into a sibling Task or remove the subtask layer.

### Subtask

- Subtasks are optional bookkeeping inside a Task. **Default to NO subtasks.**
- Add a subtask only when a single Sonnet PR has a clean internal seam
  (e.g. a database migration plus the code that uses it) where checkpointing
  helps a human reviewer.
- **NEVER** auto-emit "Implement X" / "Validate X" pairs.
- **NEVER** add subtasks just because the schema allows them.

### Open questions

- Real ambiguities you cannot resolve from the spec.
- Do not invent them to look thorough.
- An empty list is fine and often correct.

### Acceptance criteria

- Observable behaviors a user, operator, or reviewer can verify.
- Not restatements of the requirement.
- Typically 2–4 bullets per Task. More only when the surface is genuinely
  multi-faceted.

### E2E coverage — REQUIRED, one per Epic

- Every Epic MUST contain at least one Task whose title starts with `E2E:` and
  whose purpose is end-to-end verification of the user-facing behaviour the
  Epic delivers.
- The E2E Task is a real piece of work, not boilerplate. Write its
  `description` and `acceptance_criteria` against the actual flow being
  exercised — what the user does, what the system shows, what state changes,
  what evidence is captured (screenshots, logs, recorded run).
- If the Epic only has one feature Task, the Epic still has 2 Tasks total:
  the feature Task plus the `E2E:` Task that verifies it end-to-end.
- The E2E Task usually `depends_on` the feature Tasks in the same Epic. List
  those Task titles in `dependencies`.
- Do not put E2E coverage inside subtasks. It is its own Task so the executor
  can ship the E2E run as a separate PR with its own evidence trail.
- For pure-refactor Epics that have no observable user-facing surface, the
  `E2E:` Task verifies that the existing flows still pass after the refactor.

### `source_sections`

- The headings in the spec each item traces back to.
- If a Task or Subtask cannot be traced to a spec section, it probably
  shouldn't exist.
- For an Epic, list the spec sections that motivate it.

### `dependencies`

- A Task's `dependencies` is a list of OTHER Task titles in this same plan
  that must complete first.
- Use sparingly. Most Tasks are independent.

### `priority` and `complexity`

- `priority`: `low | medium | high`. Default `medium`. Use `high` only for
  Tasks that block other Tasks or are externally time-sensitive.
- `complexity`: `small | medium | large`. Estimate the size of the Sonnet PR.
  `small` = a few-file edit. `medium` = touches a feature surface. `large` =
  touches multiple surfaces — and if you reach for `large` consider whether
  you should have split into two Tasks instead.

## Calibration examples (internalize, do NOT echo in output)

Every example below already includes the mandatory `E2E:` Task per Epic.

```
Spec: "Add an uppercase button that uppercases the input field on click."
Plan: 1 Epic, 2 Tasks:
       - "Add uppercase button to input field"
       - "E2E: Uppercase button uppercases input on click"
      0 subtasks, 0 open questions.

Spec: "Build a Scrum landing page (~10 sections, hero, FAQ, mobile responsive)."
Plan: 1 Epic ("Scrum landing page"), 4-6 Tasks:
       - page scaffold
       - content sections
       - responsive + a11y polish
       - (optional) FAQ
       - "E2E: Scrum landing page renders end-to-end on desktop and mobile"
      0-2 open questions.

Spec: "Migrate auth from session cookies to JWT and add Okta SSO."
Plan: 2 Epics, each with its own E2E Task:
       Epic "Auth backend migration":
         - JWT issuer + verifier
         - Replace cookie middleware
         - "E2E: Existing auth-protected flows still work post-migration"
       Epic "Okta SSO integration":
         - Okta OIDC client
         - Login redirect + callback
         - "E2E: User can sign in via Okta and reach the dashboard"

Spec: "Triage all open bugs."
Plan: 1 Epic, 2 Tasks:
       - "Triage open bug backlog"
       - "E2E: Triage output is actionable for the next sprint"
      Plus 1 open question asking for actual priorities.
```

## Constraints

- Never expose, print, or commit secrets.
- Do not switch git branches.
- Do not modify any file outside `output` (other than reading the
  schema).
- Keep tool usage minimal. You should be able to finish in well under
  30 turns; if you find yourself burning turns, stop and write what you have.

## Self-check before stopping

Before you write your final `output/generated-plan.json`, ask yourself:

1. Could a Claude Sonnet run, given just this Task description and AC, ship a
   PR for it? For each Task, the answer must be yes.
2. Did I add any subtasks that are just "Implement X" / "Validate X"? If yes,
   delete them.
3. **Does every Epic contain at least one Task whose title starts with
   `E2E:` ?** This is mandatory. The E2E Task must verify the actual
   user-facing behaviour the Epic delivers (or, for pure-refactor Epics, that
   existing flows still pass). Reject your own draft if any Epic is missing
   it.
4. For each `E2E:` Task, are its `acceptance_criteria` written against the
   real flow (what the user does, what the system shows, what evidence is
   captured) — not generic "tests pass"?
5. Does `source_sections` for every item point to a real heading in the spec?
6. Is the JSON valid against the schema?

If all six are yes, write the file.


## Requirements content (from output/requirements-from-jira.md)

# Scrum landing page — developer specification 

## Ticket Metadata

- Jira key: KAN-124
- Status: To Do
- Priority: Medium
- Assignee: -
- Reporter: Artjoms
- Labels: -
- Components: -

## Requirements

## 1. Goal

Build a **single, static landing page** that gives a clear, accurate introduction to **Scrum** for people who are new to it (for example stakeholders or new team members). The page should be easy to scan in **two to five minutes** and encourage further learning. It does not replace formal training or the [Scrum Guide](https://scrumguides.org/).

## 2. Audience and tone

- **Primary:** Non-experts who need a correct mental model of Scrum.
- **Tone:** Plain language, confident, neutral; avoid jargon without a one-line definition.
- **Voice:** Third person or inclusive “teams”; avoid heavy marketing hype.

## 3. Content requirements

### 3.1 Must include (accurate, high level)

1. **What Scrum is** — Lightweight framework for developing, delivering, and sustaining complex products; empirical process control (transparency, inspection, adaptation). One short paragraph; optional link to the official Scrum Guide (external).
2. **When it helps** — Complex work, need for feedback and learning; not a guarantee of success.
3. **Roles (accountabilities)** — Product Owner, Scrum Master, Developers (one line each: main responsibility).
4. **Events** — Sprint, Sprint Planning, Daily Scrum, Sprint Review, Sprint Retrospective (purpose of each in one sentence).
5. **Artifacts** — Product Backlog, Sprint Backlog, Increment (plus Definition of Done as the quality commitment for the Increment). Short definitions only.
6. **Sprint** — Time-boxed container; goal is a usable Increment that meets the Definition of Done.
7. **Visual summary** — Simple diagram or structured list showing **Roles → Events → Artifacts** (implementer’s choice: structured HTML or graphic).

### 3.2 Nice to have

- Short **Myths** block (for example: Scrum is not a methodology with fixed scope agreed up front).
- **FAQ** (three to five items): relationship to Agile, difference from Kanban at a glance, who decides what is built.

### 3.3 Out of scope

- Full agile manifesto history, detailed scaling (LeSS, SAFe, etc.), tool-specific instructions (for example Jira), or certification prep.

## 4. Functional requirements

ID
Requirement
F1  
Single primary URL or route; no login; all content reachable without authentication. 
F2  
**Hero** section: headline and subheadline stating what the page is (Scrum overview). 
F3  
**Anchor navigation** or clear sections so users can jump to Roles, Events, Artifacts, Sprint. 
F4  
**Footer** with optional link to the Scrum Guide and “Last updated” or content version date. 
F5  
**Responsive:** Readable and navigable from **320px** width upward; adequate tap targets on mobile. 
F6  
**Print-friendly (optional):** Sections do not clip badly when printed or saved as PDF (basic CSS acceptable). 

## 5. Non-functional requirements

ID
Requirement
N1  
**Accessibility:** Semantic headings (`h1` → `h3`), meaningful link text, sufficient color contrast (target WCAG 2.1 AA). 
N2  
**Performance:** Minimal dependencies; avoid blocking heavy assets above the fold; target **LCP under 2.5s** on typical broadband for a simple static page. 
N3  
**SEO basics:** `<title>` and meta description; one clear `h1`. 
N4  
**Accuracy:** Terminology aligns with the current **Scrum Guide** (Product Owner, Scrum Master, Developers, events, commitments). Content should be easy to update in one place when the guide changes. 

## 6. UX and UI guidance

- **Layout:** Vertical flow; card or column layout acceptable for Roles / Events / Artifacts.
- **Hierarchy:** Limit to roughly three heading levels on this page.
- **Visual identity:** Neutral professional palette; one accent color is acceptable. No requirement for illustration unless the team adds simple icons.
- **Language:** Prefer official wording (“accountabilities” vs informal “roles”) where it matches the Scrum Guide; a separate glossary is not required if terms are defined inline.

## 7. Technical constraints

- **Stack:** Team choice (static HTML/CSS or any simple framework). Prefer **static output** where possible (easy hosting: GitHub Pages, Netlify, and similar).
- **Dependencies:** Keep to a minimum; document build steps in README if not zero-build.
- **Assets:** Optimized images if any; SVG preferred for simple diagrams.

## 8. Acceptance criteria (definition of done for delivery)

1. All **Must include** items in §3.1 are present with **no statements that contradict** the Scrum Guide at time of publication.
2. Navigation works on desktop and mobile; no layout-driven horizontal scroll on standard viewports.
3. Page passes automated **axe** or Lighthouse accessibility checks with **no critical** issues, or documented exceptions.
4. Content is maintainable (for example one config, markdown file, or component per major section).

## 9. Open decisions

- Scrum Guide language variant (English default).
- Diagram as inline SVG versus exported raster image.
- Branding (logo, colors) versus default neutral styling.

## Comments

_No comments._
