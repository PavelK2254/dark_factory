You are running inside `cursor-hack/dark_factory` for Jira ticket `KAN-133: E2E: Scrum landing page renders end-to-end on desktop and mobile`.

Read `CLAUDE.md` for repository conventions before touching files.

Ticket folder: `spec/KAN-133`.
- `spec/KAN-133/spec.md`: a fresh snapshot of the Jira ticket and its comments. Read it. Do not edit it.
- `spec/KAN-133/plan.md`: implementation plan. You own this file. Update it as you go.
- `spec/KAN-133/transcript.md`: rolling history of prior runs. Read it for context if needed.
- `spec/KAN-133/response.md`: the message that will be posted back to Jira. You own this file.

Run kind: `pr` (expects code/config changes plus a PR).
Run mode: `NEW`.

Goal:
- Make the smallest correct repository changes to satisfy the ticket.
- Update `spec/KAN-133/plan.md` with the implementation plan.
- Write a concise Jira-facing summary to `spec/KAN-133/response.md` (what changed, why, risks). Do not include logs or secrets.
- Do not create or merge pull requests; the workflow does that.

Constraints:
- Never expose, print, or commit secrets.
- Do not switch branches.
- Keep tool usage minimal.
