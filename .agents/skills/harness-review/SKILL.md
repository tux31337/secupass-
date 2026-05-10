---
name: harness-review
description: Use when reviewing changes in a repository that uses this Harness framework, especially when the user asks for a Harness review, architecture review, implementation review, or validation against AGENTS.md, ARCHITECTURE.md, ADR.md, tests, and build commands.
---

# Harness Review

Review the current changes against the repository's Harness rules.

## Inputs To Read

Read these first:

- `/AGENTS.md`
- `/docs/ARCHITECTURE.md`
- `/docs/ADR.md`

Then inspect the changed files with git status and diffs.

## Checklist

Check:

1. Architecture compliance: changes follow the directory and module structure in `ARCHITECTURE.md`.
2. Technical stack compliance: changes do not depart from choices recorded in `ADR.md`.
3. Test coverage: new behavior has relevant tests.
4. CRITICAL rules: changes do not violate `AGENTS.md` CRITICAL rules.
5. Buildability: the repository's build and test commands can pass.

## Output

Use this table:

| Item | Result | Notes |
|------|--------|-------|
| Architecture compliance | PASS/FAIL | {details} |
| Technical stack compliance | PASS/FAIL | {details} |
| Test coverage | PASS/FAIL | {details} |
| CRITICAL rules | PASS/FAIL | {details} |
| Buildability | PASS/FAIL | {details} |

If there are violations, list specific fixes with file paths. If a check could not be run, say exactly why.
