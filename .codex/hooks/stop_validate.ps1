$ErrorActionPreference = "Stop"

function Write-Json($Value) {
  $Value | ConvertTo-Json -Depth 8 -Compress
}

function Get-PackageScripts {
  if (-not (Test-Path -LiteralPath "package.json")) {
    return @{}
  }

  try {
    $package = Get-Content -Raw -LiteralPath "package.json" | ConvertFrom-Json
  } catch {
    return @{}
  }

  $scripts = @{}
  if ($package.scripts) {
    $package.scripts.PSObject.Properties | ForEach-Object {
      $scripts[$_.Name] = [string]$_.Value
    }
  }
  return $scripts
}

$rawInput = [Console]::In.ReadToEnd()
$payload = $null
if (-not [string]::IsNullOrWhiteSpace($rawInput)) {
  try {
    $payload = $rawInput | ConvertFrom-Json
  } catch {
    $payload = $null
  }
}

if ($payload -and $payload.stop_hook_active) {
  Write-Json @{ continue = $true }
  exit 0
}

$scripts = Get-PackageScripts
$commands = @()
foreach ($name in @("lint", "build", "test")) {
  if ($scripts.ContainsKey($name)) {
    $commands += @("npm", "run", $name)
  }
}

if ($commands.Count -eq 0) {
  Write-Json @{ continue = $true }
  exit 0
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Json @{
    continue = $true
    systemMessage = "npm was not found; repository validation was skipped."
  }
  exit 0
}

for ($i = 0; $i -lt $commands.Count; $i += 3) {
  $cmd = @($commands[$i], $commands[$i + 1], $commands[$i + 2])
  $output = & $cmd[0] $cmd[1] $cmd[2] 2>&1
  if ($LASTEXITCODE -ne 0) {
    $tail = ($output | Select-Object -Last 40) -join "`n"
    Write-Json @{
      decision = "block"
      reason = "Validation failed: $($cmd -join ' '). Review and fix the failure before finalizing.`n$tail"
    }
    exit 0
  }
}

Write-Json @{ continue = $true }
