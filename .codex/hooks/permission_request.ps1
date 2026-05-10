$ErrorActionPreference = "Stop"

function Write-Json($Value) {
  $Value | ConvertTo-Json -Depth 8 -Compress
}

$rawInput = [Console]::In.ReadToEnd()
if ([string]::IsNullOrWhiteSpace($rawInput)) {
  exit 0
}

try {
  $payload = $rawInput | ConvertFrom-Json
} catch {
  exit 0
}

$command = ""
if ($payload.tool_input -and $payload.tool_input.command) {
  $command = [string]$payload.tool_input.command
}

$denyPattern = "rm\s+-rf|git\s+push\s+--force|git\s+reset\s+--hard|DROP\s+TABLE|Remove-Item\s+.*-Recurse\s+.*-Force"
if ($command -match $denyPattern) {
  Write-Json @{
    hookSpecificOutput = @{
      hookEventName = "PermissionRequest"
      decision = @{
        behavior = "deny"
        message = "Destructive command blocked by repository hook."
      }
    }
  }
}
