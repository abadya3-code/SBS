$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$RemoteUrl = "https://github.com/abadya3-code/SBS.git"
$CommitMessage = "Initial SBTS v2.0.0-beta.4 Railway-ready release"

function Run-Git {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$GitArgs)
  & git @GitArgs
  if ($LASTEXITCODE -ne 0) {
    throw "Git command failed: git $($GitArgs -join ' ')"
  }
}

Write-Host "" 
Write-Host "SBTS - Clean GitHub Upload" -ForegroundColor Cyan
Write-Host "Repository: $RemoteUrl" -ForegroundColor DarkCyan
Write-Host "Project root: $PSScriptRoot" -ForegroundColor DarkCyan
Write-Host ""

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  throw "Git for Windows is not installed or is not available in PATH."
}

if (-not (Test-Path "package.json") -or -not (Test-Path "railway.json")) {
  throw "This script must be inside the project root containing package.json and railway.json."
}

if (Test-Path ".env") {
  Write-Host "WARNING: .env exists. It is ignored by .gitignore; do not force-add it." -ForegroundColor Yellow
}

Write-Host "This will remove only the local .git metadata and recreate a clean repository." -ForegroundColor Yellow
Write-Host "The project source files will not be deleted." -ForegroundColor Yellow
$confirm = Read-Host "Type YES to continue"
if ($confirm -ne "YES") {
  Write-Host "Cancelled." -ForegroundColor Yellow
  exit 0
}

if (Test-Path ".git") {
  Write-Host "Removing stale local Git metadata, including any COMMIT_EDITMSG swap file..." -ForegroundColor Cyan
  Remove-Item -LiteralPath ".git" -Recurse -Force
}

Run-Git init

$name = git config --global user.name
if (-not $name) {
  $name = Read-Host "Enter the Git author name (example: Abdullah Alaqil)"
  Run-Git config --global user.name $name
}

$email = git config --global user.email
if (-not $email) {
  $email = Read-Host "Enter the email registered or verified in GitHub"
  Run-Git config --global user.email $email
}

Write-Host "Adding project files..." -ForegroundColor Cyan
Run-Git add .

$staged = & git diff --cached --name-only
if ($LASTEXITCODE -ne 0) {
  throw "Could not inspect staged files."
}
if (-not $staged) {
  throw "No files were staged. Confirm that this is the project root and that .gitignore is not excluding the project."
}

Write-Host "Checking that secrets and generated folders are not staged..." -ForegroundColor Cyan
$unsafe = $staged | Where-Object { $_ -match '(^|/)\.env($|\.)|(^|/)node_modules/|(^|/)dist/' }
if ($unsafe) {
  Write-Host "Unsafe files detected:" -ForegroundColor Red
  $unsafe | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
  throw "Remove the unsafe files from the Git index before pushing."
}

Run-Git commit -m $CommitMessage
Run-Git branch -M main
Run-Git remote add origin $RemoteUrl

Write-Host "" 
Write-Host "Local verification:" -ForegroundColor Cyan
Run-Git status --short
Run-Git branch --show-current
Run-Git log --oneline -1
Run-Git remote -v

Write-Host "" 
Write-Host "Pushing to GitHub. A browser sign-in window may open." -ForegroundColor Cyan
Run-Git push -u origin main

Write-Host "" 
Write-Host "SUCCESS: The first commit was pushed to GitHub." -ForegroundColor Green
Write-Host "Open https://github.com/abadya3-code/SBS and confirm package.json, railway.json, client and server are visible." -ForegroundColor Green
Write-Host "Then return to Railway, refresh the repository list and deploy the SBS repository." -ForegroundColor Green
