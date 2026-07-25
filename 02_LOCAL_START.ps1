$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "SBTS local setup" -ForegroundColor Cyan

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw "Node.js 22 is required."
}
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  throw "Docker Desktop is required."
}

corepack enable
corepack prepare pnpm@10.4.1 --activate
pnpm install --frozen-lockfile

if (-not (Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
  Write-Host "Created .env from .env.example. Review ADMIN_EMAIL and ADMIN_PASSWORD before production use." -ForegroundColor Yellow
}

docker compose -f docker-compose.local.yml up -d
pnpm db:migrate
pnpm admin:create
pnpm dev
