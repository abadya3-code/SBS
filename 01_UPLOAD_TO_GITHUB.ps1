$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$RemoteUrl = "https://github.com/abadya3-code/SBS.git"
$CommitMessage = "SBTS v2.0.0-beta.4 Railway-ready"

Write-Host "" 
Write-Host "SBTS - GitHub Upload" -ForegroundColor Cyan
Write-Host "Target: $RemoteUrl" -ForegroundColor DarkCyan
Write-Host ""

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Host "Git is not installed. Install Git for Windows, then run this file again." -ForegroundColor Red
  exit 1
}

if (Test-Path ".env") {
  Write-Host "ERROR: .env exists in the project folder. It will not be uploaded because of .gitignore, but confirm it contains no file that was renamed." -ForegroundColor Yellow
}

if (-not (Test-Path "package.json") -or -not (Test-Path "railway.json")) {
  Write-Host "ERROR: Run this script from the project root containing package.json and railway.json." -ForegroundColor Red
  exit 1
}

$name = git config --global user.name
if (-not $name) {
  $name = Read-Host "Enter your Git author name"
  git config --global user.name $name
}

$email = git config --global user.email
if (-not $email) {
  $email = Read-Host "Enter your GitHub email"
  git config --global user.email $email
}

if (-not (Test-Path ".git")) {
  git init -b main
} else {
  git branch -M main
}

git add .

$hasCommit = $true
git rev-parse --verify HEAD 2>$null
if ($LASTEXITCODE -ne 0) { $hasCommit = $false }

if (-not $hasCommit) {
  git commit -m $CommitMessage
} else {
  git diff --cached --quiet
  if ($LASTEXITCODE -ne 0) {
    git commit -m $CommitMessage
  } else {
    Write-Host "No new changes to commit." -ForegroundColor Yellow
  }
}

$origin = git remote get-url origin 2>$null
if ($LASTEXITCODE -eq 0) {
  git remote set-url origin $RemoteUrl
} else {
  git remote add origin $RemoteUrl
}

Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
git push -u origin main

Write-Host ""
Write-Host "Upload completed." -ForegroundColor Green
Write-Host "Open: https://github.com/abadya3-code/SBS" -ForegroundColor Green
Write-Host "Then return to Railway, Configure GitHub App if needed, and press Refresh." -ForegroundColor Green
