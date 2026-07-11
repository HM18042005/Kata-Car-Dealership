<#
.SYNOPSIS
    Sets up and runs the Kata Car Dealership project — FastAPI backend + React/Vite frontend.

.DESCRIPTION
    One-command dev runner. It:
      1. Verifies prerequisites (Python, Node, npm) and that MongoDB is reachable.
      2. Backend: creates backend/.venv, installs requirements, writes backend/.env
         (with a generated SECRET_KEY + dev ADMIN_PASSWORD) if missing, seeds the admin.
      3. Frontend: installs npm dependencies.
      4. Launches the backend (uvicorn, http://localhost:8000) and the frontend
         (Vite, http://localhost:5173) each in its own window.

.PARAMETER SkipInstall
    Skip dependency installation (pip + npm). Use for fast restarts once set up.

.PARAMETER SkipSeed
    Skip seeding the admin user.

.EXAMPLE
    .\run.ps1
.EXAMPLE
    .\run.ps1 -SkipInstall
#>
[CmdletBinding()]
param(
    [switch]$SkipInstall,
    [switch]$SkipSeed
)

$ErrorActionPreference = "Stop"

$root     = $PSScriptRoot
$backend  = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"

function Write-Step($msg) { Write-Host "`n=== $msg ===" -ForegroundColor Cyan }
function Fail($msg)       { Write-Host "ERROR: $msg" -ForegroundColor Red; exit 1 }

# --- Prerequisites -----------------------------------------------------------
Write-Step "Checking prerequisites"
foreach ($cmd in @("python", "node", "npm")) {
    if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
        Fail "'$cmd' not found on PATH. Install it and retry."
    }
}
Write-Host "python $(python --version 2>&1) | node $(node --version) | npm $(npm --version)"

# --- MongoDB reachability (warn only) ----------------------------------------
$mongoOk = Test-NetConnection -ComputerName localhost -Port 27017 `
    -InformationLevel Quiet -WarningAction SilentlyContinue
if ($mongoOk) {
    Write-Host "MongoDB reachable on localhost:27017"
} else {
    Write-Host "WARNING: MongoDB is not reachable on localhost:27017." -ForegroundColor Yellow
    Write-Host "         Start mongod before using the app (admin seeding is skipped)." -ForegroundColor Yellow
}

# --- Backend setup -----------------------------------------------------------
Write-Step "Backend setup"
$venvPy = Join-Path $backend ".venv\Scripts\python.exe"
if (-not (Test-Path $venvPy)) {
    Write-Host "Creating virtualenv (backend/.venv)..."
    python -m venv (Join-Path $backend ".venv")
}
if (-not $SkipInstall) {
    Write-Host "Installing backend requirements..."
    & $venvPy -m pip install --upgrade pip *> $null
    & $venvPy -m pip install -r (Join-Path $backend "requirements.txt")
    if ($LASTEXITCODE -ne 0) { Fail "pip install failed." }
}

# backend/.env from .env.example, with real SECRET_KEY + dev ADMIN_PASSWORD
$envFile       = Join-Path $backend ".env"
$adminEmail    = "admin@example.com"
$adminPassword = "Admin12345"
if (-not (Test-Path $envFile)) {
    Write-Host "Creating backend/.env from .env.example"
    $secret = -join ((1..64) | ForEach-Object { '{0:x}' -f (Get-Random -Maximum 16) })
    (Get-Content (Join-Path $backend ".env.example")) | ForEach-Object {
        $_ -replace '^SECRET_KEY=.*',     "SECRET_KEY=$secret" `
           -replace '^ADMIN_PASSWORD=.*', "ADMIN_PASSWORD=$adminPassword"
    } | Set-Content $envFile
} else {
    Write-Host "backend/.env already exists — leaving it untouched."
}

# --- Seed admin --------------------------------------------------------------
if (-not $SkipSeed -and $mongoOk) {
    Write-Step "Seeding admin user (idempotent)"
    Push-Location $backend
    try { & $venvPy -m app.seed_admin; Write-Host "Admin ready." }
    catch { Write-Host "Seed skipped/failed: $_" -ForegroundColor Yellow }
    Pop-Location
}

# --- Frontend setup ----------------------------------------------------------
Write-Step "Frontend setup"
if (-not $SkipInstall -or -not (Test-Path (Join-Path $frontend "node_modules"))) {
    Write-Host "Installing frontend dependencies..."
    Push-Location $frontend
    npm install
    if ($LASTEXITCODE -ne 0) { Pop-Location; Fail "npm install failed." }
    Pop-Location
}

# --- Launch both servers -----------------------------------------------------
Write-Step "Starting servers"
$psHost = if (Get-Command pwsh -ErrorAction SilentlyContinue) { "pwsh" } else { "powershell" }
Start-Process $psHost -ArgumentList "-NoExit", "-Command",
    "Set-Location '$backend'; & '$venvPy' -m uvicorn app.main:app --reload --port 8000"
Start-Process $psHost -ArgumentList "-NoExit", "-Command",
    "Set-Location '$frontend'; npm run dev"

Write-Host ""
Write-Host "Backend:  http://localhost:8000  (Swagger UI at /docs)" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
if (-not $SkipSeed) {
    Write-Host "Admin login: $adminEmail / $adminPassword  (from backend/.env)" -ForegroundColor Green
}
Write-Host "Two new windows opened — close them to stop the servers." -ForegroundColor Green
