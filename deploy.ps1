# APM Portal - Complete Deployment Script for Windows
# This script sets up everything needed for production deployment
#
# Usage: .\deploy.ps1 [-Init] [-Update] [-Reset]

param(
    [switch]$Init,
    [switch]$Update,
    [switch]$Reset
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  APM Portal - Deployment Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
try {
    $null = docker --version
} catch {
    Write-Host "Error: Docker is not installed" -ForegroundColor Red
    exit 1
}

# Default to Init mode
if (-not $Init -and -not $Update -and -not $Reset) {
    $Init = $true
}

# Reset mode
if ($Reset) {
    Write-Host "WARNING: This will delete all data!" -ForegroundColor Yellow
    $confirm = Read-Host "Are you sure? (y/N)"
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        Write-Host "Cancelled."
        exit 0
    }
    
    Write-Host "Stopping and removing containers..." -ForegroundColor Yellow
    docker-compose down -v 2>$null
    $Init = $true
}

# Start containers
Write-Host "Starting Docker containers..." -ForegroundColor Green
docker-compose up -d

# Wait for services
Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Wait for Directus
$maxRetries = 30
$retryCount = 0
do {
    $retryCount++
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8055/server/health" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) { break }
    } catch {}
    
    if ($retryCount -ge $maxRetries) {
        Write-Host "Directus failed to start after $maxRetries attempts" -ForegroundColor Red
        exit 1
    }
    Write-Host "  Waiting for Directus... (attempt $retryCount/$maxRetries)"
    Start-Sleep -Seconds 3
} while ($true)

Write-Host "Directus is ready!" -ForegroundColor Green

# Run schema setup if init
if ($Init) {
    Write-Host "Setting up Directus schema..." -ForegroundColor Green
    
    try {
        node scripts/setup-directus-complete.js
    } catch {
        Write-Host "Warning: Could not run schema setup automatically." -ForegroundColor Yellow
        Write-Host "Please run manually: node scripts/setup-directus-complete.js" -ForegroundColor Yellow
    }
}

# Build Next.js
if (Test-Path "package.json") {
    Write-Host "Installing dependencies..." -ForegroundColor Green
    npm install
    
    Write-Host "Building Next.js app..." -ForegroundColor Green
    npm run build
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Services:"
Write-Host "  Next.js:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Directus: http://localhost:8055" -ForegroundColor Cyan
Write-Host ""
Write-Host "Admin Login:"
Write-Host "  Email: admin@apm-portal.id"
Write-Host "  Password: Admin@APM2026!"
Write-Host ""
Write-Host "Remember to change admin password in production!" -ForegroundColor Yellow
Write-Host ""

# Start Next.js in production
if ($Init -or $Update) {
    Write-Host "Starting Next.js in production mode..." -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
    npm run start
}
