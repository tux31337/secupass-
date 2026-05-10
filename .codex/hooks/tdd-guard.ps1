$ErrorActionPreference = "Stop"

function Write-Json($Value) {
  $Value | ConvertTo-Json -Depth 8 -Compress
}

function Save-State {
  param([bool]$RedConfirmed)
  New-Item -ItemType Directory -Force -Path $script:StateDir | Out-Null
  "TDD_RED_CONFIRMED=$([int]$RedConfirmed)" | Set-Content -Encoding UTF8 -LiteralPath $script:StateFile
  "TDD_UPDATED_AT=$((Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ'))" | Add-Content -Encoding UTF8 -LiteralPath $script:StateFile
}

function Read-State {
  if (-not (Test-Path -LiteralPath $script:StateFile)) {
    return $false
  }

  $state = Get-Content -LiteralPath $script:StateFile -ErrorAction SilentlyContinue
  return [bool]($state -match '^TDD_RED_CONFIRMED=1$')
}

function Get-CommandText($Payload) {
  if ($Payload.tool_input -and $Payload.tool_input.command) {
    return [string]$Payload.tool_input.command
  }
  return ""
}

function Test-IsTestCommand {
  param([string]$Command)
  return $Command -match '(^|[ ;|&])(npm|pnpm|yarn) ([^;&|]* )?(test|vitest|jest)' `
    -or $Command -match '(^|[ ;|&])pytest(\s|$)' `
    -or $Command -match '(^|[ ;|&])cargo test(\s|$)' `
    -or $Command -match '(^|[ ;|&])go test(\s|$)'
}

function Test-SuccessOutput {
  param([string]$Raw)
  return $Raw -match '"exit_code"\s*:\s*0' -or $Raw -match '"exitCode"\s*:\s*0' -or $Raw -match '"status"\s*:\s*"success"'
}

function Test-FailureOutput {
  param([string]$Raw)
  return $Raw -match '"exit_code"\s*:\s*[1-9][0-9]*' -or $Raw -match '"exitCode"\s*:\s*[1-9][0-9]*' -or $Raw -match '"status"\s*:\s*"(failed|failure|error)"'
}

function Get-PatchPaths {
  param([string]$Raw)
  $decoded = $Raw -replace '\\n', "`n"
  $matches = [regex]::Matches($decoded, '^\*\*\* (?:Add|Update|Delete|Move to) File: (.+)$', [System.Text.RegularExpressions.RegexOptions]::Multiline)
  foreach ($match in $matches) {
    $match.Groups[1].Value.Trim()
  }
}

function Test-IsTestPath {
  param([string]$Path)
  return $Path -match '(^|/)(tests|test|__tests__)/' -or $Path -match '\.(test|spec)\.' -or $Path -match '(Test|Tests|Spec|Specs)\.'
}

function Test-IsNonProductPath {
  param([string]$Path)
  return $Path -match '^(\.codex|\.agents|docs|phases)/' `
    -or $Path -match '\.md$' `
    -or $Path -match '^(AGENTS\.md|README|CHANGELOG|LICENSE)'
}

function Test-HasProductPath {
  param([string[]]$Paths)
  foreach ($path in $Paths) {
    if ([string]::IsNullOrWhiteSpace($path)) {
      continue
    }
    if (Test-IsTestPath $path) {
      continue
    }
    if (Test-IsNonProductPath $path) {
      continue
    }
    return $true
  }
  return $false
}

$root = git rev-parse --show-toplevel 2>$null
if (-not $root) {
  $root = (Get-Location).Path
}

$script:StateDir = Join-Path $root ".codex/state"
$script:StateFile = Join-Path $script:StateDir "tdd-guard.env"

$rawInput = [Console]::In.ReadToEnd()
if ([string]::IsNullOrWhiteSpace($rawInput)) {
  exit 0
}

try {
  $payload = $rawInput | ConvertFrom-Json
} catch {
  exit 0
}

$event = [string]$payload.hook_event_name
$tool = [string]$payload.tool_name
$command = Get-CommandText $payload
$redConfirmed = Read-State

if ($event -eq "PreToolUse") {
  $paths = @(Get-PatchPaths $rawInput)
  if ($paths.Count -gt 0 -and (Test-HasProductPath $paths) -and -not $redConfirmed) {
    Write-Json @{
      hookSpecificOutput = @{
        hookEventName = "PreToolUse"
        permissionDecision = "deny"
        permissionDecisionReason = "TDD guard: production code edits are blocked until a relevant test has been added and observed failing. Add or update tests first, run the test, then make the implementation pass."
      }
    }
  }
  exit 0
}

if ($event -eq "PostToolUse" -and $tool -eq "Bash" -and (Test-IsTestCommand $command)) {
  if (Test-FailureOutput $rawInput) {
    Save-State $true
    Write-Json @{ systemMessage = "TDD guard: failing test observed. Production edits are now allowed for the green step." }
    exit 0
  }

  if (Test-SuccessOutput $rawInput) {
    Save-State $false
    Write-Json @{ systemMessage = "TDD guard: tests are green. The next production change must start with a failing test." }
    exit 0
  }
}
