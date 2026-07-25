$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$repoUrl = "https://github.com/abadya3-code/SBS.git"

Write-Host "SBTS first GitHub connection" -ForegroundColor Cyan
Write-Host "This runs once and preserves the existing GitHub history." -ForegroundColor Yellow

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  throw "Git is not installed or not available in PATH."
}

if (-not (Test-Path ".git")) {
  git init -b main
}

git symbolic-ref HEAD refs/heads/main

$origin = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
  git remote add origin $repoUrl
} elseif ($origin -ne $repoUrl) {
  git remote set-url origin $repoUrl
}

if (-not (git config user.name)) {
  $name = Read-Host "Enter your Git name (example: Abdullah Alaqil)"
  git config user.name $name
}
if (-not (git config user.email)) {
  $email = Read-Host "Enter your GitHub verified email"
  git config user.email $email
}

Write-Host "Fetching the current GitHub main branch..." -ForegroundColor Cyan
git fetch origin main
if ($LASTEXITCODE -ne 0) { throw "Could not fetch origin/main." }

# Adopt the remote history without replacing this package's working files.
git reset --mixed origin/main

git add -A
$staged = git diff --cached --name-only
if (-not $staged) {
  git branch --set-upstream-to=origin/main main 2>$null
  Write-Host "No source differences found. Repository is connected and ready." -ForegroundColor Green
  exit 0
}

$message = Read-Host "Commit message [Deploy SBTS v2.0.0-beta.4.2 master release]"
if ([string]::IsNullOrWhiteSpace($message)) {
  $message = "Deploy SBTS v2.0.0-beta.4.2 master release"
}

git commit -m $message
if ($LASTEXITCODE -ne 0) { throw "Git commit failed." }

git push -u origin main
if ($LASTEXITCODE -ne 0) { throw "Git push failed." }

Write-Host "Completed. Future updates use 02_PUSH_UPDATE.cmd." -ForegroundColor Green
