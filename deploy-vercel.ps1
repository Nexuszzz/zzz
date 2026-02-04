# Quick Deploy Script untuk APM Portal ke Vercel (Windows)
# Author: AI Assistant
# Date: Feb 2026

Write-Host "🚀 APM Portal - Vercel Deployment Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if git repo
if (-not (Test-Path ".git")) {
    Write-Host "⚠️  Git repository not initialized!" -ForegroundColor Yellow
    Write-Host "   Run: git init" -ForegroundColor Yellow
    exit 1
}

# Check if Vercel CLI installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

Write-Host "✅ Prerequisites checked" -ForegroundColor Green
Write-Host ""

# Login to Vercel
Write-Host "🔐 Logging in to Vercel..." -ForegroundColor Cyan
vercel login

Write-Host ""
Write-Host "📝 Make sure you have set these ENV variables in Vercel Dashboard:" -ForegroundColor Yellow
Write-Host "   - DATABASE_URL (pooled connection with -pooler)" -ForegroundColor White
Write-Host "   - DIRECT_URL (direct connection without -pooler)" -ForegroundColor White
Write-Host "   - NEXTAUTH_SECRET" -ForegroundColor White
Write-Host "   - NEXTAUTH_URL" -ForegroundColor White
Write-Host "   - NEXT_PUBLIC_APP_URL" -ForegroundColor White
Write-Host ""
$continue = Read-Host "Have you set all ENV variables? (y/n)"

if ($continue -ne "y" -and $continue -ne "Y") {
    Write-Host "❌ Please set environment variables first in Vercel Dashboard" -ForegroundColor Red
    Write-Host "   https://vercel.com/dashboard" -ForegroundColor White
    exit 1
}

# Deploy
Write-Host ""
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Cyan
Write-Host ""

if ($args[0] -eq "--prod") {
    Write-Host "📦 Production deployment..." -ForegroundColor Green
    vercel --prod
} else {
    Write-Host "🔍 Preview deployment..." -ForegroundColor Yellow
    vercel
}

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 View logs: vercel logs" -ForegroundColor White
Write-Host "🌐 View dashboard: https://vercel.com/dashboard" -ForegroundColor White
Write-Host ""
