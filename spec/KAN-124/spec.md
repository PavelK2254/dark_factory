# KAN-124: Scrum landing page — developer specification 

Generated from Jira on 2026-05-09T16:09:15.257Z.

## Issue Details

| Field | Value |
|---|---|
| Key | KAN-124 |
| Title | Scrum landing page — developer specification  |
| Type | Task |
| Status | To Do |
| Priority | Medium |
| Assignee | - |
| Reporter | Artjoms |
| Labels | - |
| Components | - |
| Created | 2026-05-09T19:08:42.234+0300 |
| Updated | 2026-05-09T19:08:42.377+0300 |

## Description

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

## Comments (0)

_No comments._
