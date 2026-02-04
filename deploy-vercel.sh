#!/bin/bash

# Quick Deploy Script untuk APM Portal ke Vercel
# Author: AI Assistant
# Date: Feb 2026

echo "🚀 APM Portal - Vercel Deployment Script"
echo "=========================================="
echo ""

# Check if git repo
if [ ! -d ".git" ]; then
    echo "⚠️  Git repository not initialized!"
    echo "   Run: git init"
    exit 1
fi

# Check if Vercel CLI installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "✅ Prerequisites checked"
echo ""

# Login to Vercel
echo "🔐 Logging in to Vercel..."
vercel login

echo ""
echo "📝 Make sure you have set these ENV variables in Vercel Dashboard:"
echo "   - DATABASE_URL (pooled connection with -pooler)"
echo "   - DIRECT_URL (direct connection without -pooler)"
echo "   - NEXTAUTH_SECRET"
echo "   - NEXTAUTH_URL"
echo "   - NEXT_PUBLIC_APP_URL"
echo ""
read -p "Have you set all ENV variables? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Please set environment variables first in Vercel Dashboard"
    echo "   https://vercel.com/dashboard"
    exit 1
fi

# Deploy
echo ""
echo "🚀 Deploying to Vercel..."
echo ""

if [ "$1" == "--prod" ]; then
    echo "📦 Production deployment..."
    vercel --prod
else
    echo "🔍 Preview deployment..."
    vercel
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 View logs: vercel logs"
echo "🌐 View dashboard: https://vercel.com/dashboard"
echo ""
