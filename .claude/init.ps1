<#
  MuunCode: Harness Verification Script
  Run from the project root as: .\.claude\init.ps1
#>

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path $PSScriptRoot -Parent

Write-Host "=== MuunCode Harness Verification ===" -ForegroundColor Cyan

# 1. Feature list: reject multiple in_progress
$featureListPath = Join-Path $PSScriptRoot "feature_list.json"
if (-not (Test-Path $featureListPath)) {
    Write-Host "[ERROR] Missing $featureListPath" -ForegroundColor Red
    exit 1
}

$features = Get-Content $featureListPath -Raw | ConvertFrom-Json
$inProgress = @($features | Where-Object { $_.status -eq "in_progress" })
if ($inProgress.Count -gt 1) {
    Write-Host "[ERROR] Multiple features are in_progress:" -ForegroundColor Red
    $inProgress | ForEach-Object { Write-Host "  - $($_.id): $($_.name)" -ForegroundColor Red }
    exit 1
}

# 2. Show next pending feature (quick orientation)
$next = $features | Where-Object { $_.status -eq "pending" } | Select-Object -First 1
if ($next) {
    Write-Host "[INFO] Next pending feature: $($next.id) - $($next.name)" -ForegroundColor Yellow
} else {
    Write-Host "[INFO] No pending features found." -ForegroundColor Yellow
}

if ($inProgress.Count -eq 1) {
    Write-Host "[INFO] Feature in progress: $($inProgress[0].id) - $($inProgress[0].name)" -ForegroundColor Yellow
}

# 3. Runtime / virtual environment check
# NOTE: Stack not finalized yet (see CLAUDE.md -> Technical Stack). Once
# features/00_foundation decides the stack, add the relevant checks here, e.g.:
#   Python:  Test-Path (Join-Path $projectRoot ".venv\Scripts\python.exe")
#   Node:    Test-Path (Join-Path $projectRoot "node_modules")
#   ESP-IDF: Test-Path $env:IDF_PATH
Write-Host "[INFO] No runtime/stack checks configured yet (stack not finalized)." -ForegroundColor Yellow

# 4. Dependency manifest check
# NOTE: same as above, add once the stack is decided, e.g.:
#   Test-Path (Join-Path $projectRoot "package.json")
#   Test-Path (Join-Path $projectRoot "requirements.txt")
Write-Host "[INFO] No dependency manifest configured yet (stack not finalized)." -ForegroundColor Yellow

# 5. Run tests if any exist (do not fail if there are none yet)
Write-Host "[INFO] No test runner configured yet (stack not finalized)." -ForegroundColor Yellow

# 6. Progress folder check
$progressPath = Join-Path $PSScriptRoot "progress"
if (-not (Test-Path $progressPath)) {
    Write-Host "[ERROR] Missing $progressPath" -ForegroundColor Red
    exit 1
}
$currentPath = Join-Path $progressPath "current.md"
$historyPath = Join-Path $progressPath "history.md"
if (-not (Test-Path $currentPath) -or -not (Test-Path $historyPath)) {
    Write-Host "[ERROR] Missing current.md or history.md under $progressPath" -ForegroundColor Red
    exit 1
}

Write-Host "=== Harness OK ===" -ForegroundColor Green
