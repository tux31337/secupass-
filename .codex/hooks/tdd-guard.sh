#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
STATE_DIR="$ROOT/.codex/state"
STATE_FILE="$STATE_DIR/tdd-guard.env"
mkdir -p "$STATE_DIR"

TDD_RED_CONFIRMED=0
if [ -f "$STATE_FILE" ]; then
  # shellcheck disable=SC1090
  . "$STATE_FILE"
fi

json_escape() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g; s/$/\\n/' | tr -d '\n' | sed 's/\\n$//'
}

emit_deny() {
  reason="$(json_escape "$1")"
  printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"%s"}}\n' "$reason"
}

emit_message() {
  message="$(json_escape "$1")"
  printf '{"systemMessage":"%s"}\n' "$message"
}

save_state() {
  {
    printf 'TDD_RED_CONFIRMED=%s\n' "$TDD_RED_CONFIRMED"
    printf 'TDD_UPDATED_AT=%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  } > "$STATE_FILE"
}

is_test_command() {
  printf '%s' "$1" | grep -Eiq '(^|[ ;|&])(npm|pnpm|yarn) ([^;&|]* )?(test|vitest|jest)|(^|[ ;|&])pytest(\s|$)|(^|[ ;|&])cargo test(\s|$)|(^|[ ;|&])go test(\s|$)'
}

is_success_output() {
  printf '%s' "$1" | grep -Eiq '"exit_code"[[:space:]]*:[[:space:]]*0|"exitCode"[[:space:]]*:[[:space:]]*0|"status"[[:space:]]*:[[:space:]]*"success"'
}

is_failure_output() {
  printf '%s' "$1" | grep -Eiq '"exit_code"[[:space:]]*:[[:space:]]*[1-9][0-9]*|"exitCode"[[:space:]]*:[[:space:]]*[1-9][0-9]*|"status"[[:space:]]*:[[:space:]]*"(failed|failure|error)"'
}

extract_command() {
  printf '%s' "$1" |
    sed -n 's/.*"command"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' |
    sed 's/\\"/"/g; s/\\n/ /g'
}

extract_patch_paths() {
  printf '%s' "$1" |
    sed 's/\\n/\
/g' |
    sed -n 's/^\*\*\* \(Add\|Update\|Delete\|Move to\) File: //p'
}

is_test_path() {
  case "$1" in
    tests/*|test/*|__tests__/*|*.test.*|*.spec.*|*Test.*|*Tests.*|*Spec.*|*Specs.*) return 0 ;;
    *) return 1 ;;
  esac
}

is_non_product_path() {
  case "$1" in
    .codex/*|.agents/*|docs/*|phases/*|*.md|AGENTS.md|README*|CHANGELOG*|LICENSE*) return 0 ;;
    *) return 1 ;;
  esac
}

has_product_path() {
  while IFS= read -r path; do
    [ -z "$path" ] && continue
    is_test_path "$path" && continue
    is_non_product_path "$path" && continue
    return 0
  done
  return 1
}

input="$(cat)"
event="$(printf '%s' "$input" | sed -n 's/.*"hook_event_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
tool="$(printf '%s' "$input" | sed -n 's/.*"tool_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
command="$(extract_command "$input")"

if [ "$event" = "PreToolUse" ]; then
  paths="$(extract_patch_paths "$input")"
  if [ -n "$paths" ] && printf '%s\n' "$paths" | has_product_path && [ "${TDD_RED_CONFIRMED:-0}" != "1" ]; then
    emit_deny "TDD guard: production code edits are blocked until a relevant test has been added and observed failing. Add or update tests first, run the test, then make the implementation pass."
  fi
  exit 0
fi

if [ "$event" = "PostToolUse" ] && [ "$tool" = "Bash" ] && is_test_command "$command"; then
  if is_failure_output "$input"; then
    TDD_RED_CONFIRMED=1
    save_state
    emit_message "TDD guard: failing test observed. Production edits are now allowed for the green step."
    exit 0
  fi

  if is_success_output "$input"; then
    TDD_RED_CONFIRMED=0
    save_state
    emit_message "TDD guard: tests are green. The next production change must start with a failing test."
    exit 0
  fi
fi

exit 0
