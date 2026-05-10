---
name: harness-workflow
description: Use when working with this repository's Harness framework: exploring docs, designing phased implementation plans, creating phases/index.json and phases/{task}/stepN.md files, or running scripts/execute.py to execute sequential Codex steps.
---

# Harness Workflow

Use this repository's Harness framework for multi-step implementation work.

## Workflow

1. Explore `/docs/` first, especially PRD, ARCHITECTURE, ADR, and UI guide documents.
2. Ask the user about concrete product or technical decisions only when local docs do not answer them and guessing would be risky.
3. When the user asks for an implementation plan, split the work into small sequential steps and ask for feedback before creating phase files.
4. After approval, create or update `phases/index.json`, `phases/{task-name}/index.json`, and one `phases/{task-name}/step{N}.md` file per step.
5. Run the harness with `python3 scripts/execute.py {task-name}`. Use `--push` only when the user asks for push behavior.

## Step Design Rules

- Keep scope minimal: one layer or module per step. Split steps when multiple modules must change.
- Make every step self-contained. Do not rely on previous chat context; include all required file paths and decisions in the step file.
- Force preparation: list docs and previous-step files that the next Codex session must read.
- Specify interfaces and signatures when useful, but leave internal implementation to the executing agent.
- Include only executable acceptance criteria such as `npm run build` and `npm test`.
- Write concrete warnings in the form "Do not do X. Reason: Y."
- Use kebab-case step names such as `project-setup`, `api-layer`, or `auth-flow`.

## File Templates

Top-level phase index:

```json
{
  "phases": [
    {
      "dir": "0-mvp",
      "status": "pending"
    }
  ]
}
```

Task index:

```json
{
  "project": "<project-name>",
  "phase": "<task-name>",
  "steps": [
    { "step": 0, "name": "project-setup", "status": "pending" },
    { "step": 1, "name": "core-types", "status": "pending" },
    { "step": 2, "name": "api-layer", "status": "pending" }
  ]
}
```

Rules:

- `project`: project name from `AGENTS.md` or user context.
- `phase`: task name, matching the task directory.
- `steps[].step`: zero-based step number.
- `steps[].name`: kebab-case slug.
- `steps[].status`: initially `pending`.
- Do not create timestamp fields up front. `scripts/execute.py` records `created_at`, `started_at`, `completed_at`, `failed_at`, and `blocked_at`.

Step file template:

```markdown
# Step {N}: {name}

## Files To Read

Read these files first and understand the architecture and design intent:

- `/docs/ARCHITECTURE.md`
- `/docs/ADR.md`
- {files created or modified by earlier steps}

## Task

{Concrete implementation instructions. Include target paths, function/class signatures, and important behavior.}

## Acceptance Criteria

```bash
npm run build
npm test
```

## Verification

1. Run the AC commands.
2. Check that the work follows `ARCHITECTURE.md`, `ADR.md`, and `AGENTS.md` CRITICAL rules.
3. Update `phases/{task-name}/index.json`:
   - Success: `"status": "completed"` and `"summary": "one-line summary"`
   - Failure after retries: `"status": "error"` and `"error_message": "specific error"`
   - User intervention needed: `"status": "blocked"` and `"blocked_reason": "specific reason"`

## Do Not

- {Concrete prohibition. Reason: specific reason}
- Do not break existing tests.
```

## Execution Behavior

`scripts/execute.py` automatically:

- creates or checks out `feat-{task-name}`;
- injects `AGENTS.md` and `docs/*.md` into each step prompt;
- passes completed step summaries into later steps;
- retries failed steps up to three times with the previous error message;
- separates code commits from harness metadata commits;
- records step and phase timestamps.

To recover from `error` or `blocked`, edit `phases/{task-name}/index.json`, set the step status back to `pending`, remove the error or blocked reason, then rerun the harness.
