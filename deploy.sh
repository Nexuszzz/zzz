#!/bin/bash
# APM Portal - Complete Deployment Script
# This script sets up everything needed for production deployment
#
# Usage: ./deploy.sh [OPTIONS]
#   --init        First time setup (creates containers + schema)
#   --update      Update existing deployment
#   --reset       Reset and recreate everything

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}  APM Portal - Deployment Script${NC}"
echo -e "${BLUE}==========================================${NC}"
echo ""

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed${NC}"
    exit 1
fi

# Parse arguments
INIT_MODE=false
UPDATE_MODE=false
RESET_MODE=false

for arg in "$@"; do
    case $arg in
        --init)
            INIT_MODE=true
            shift
            ;;
        --update)
            UPDATE_MODE=true
            shift
            ;;
        --reset)
            RESET_MODE=true
            shift
            ;;
    esac
done

# Default to init mode if no argument provided
if [ "$INIT_MODE" = false ] && [ "$UPDATE_MODE" = false ] && [ "$RESET_MODE" = false ]; then
    INIT_MODE=true
fi

# Reset mode: clean everything
if [ "$RESET_MODE" = true ]; then
    echo -e "${YELLOW}⚠️  Reset mode: This will delete all data!${NC}"
    read -p "Are you sure? (y/N): " confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        echo "Cancelled."
        exit 0
    fi
    
    echo -e "${YELLOW}🗑️  Stopping and removing containers...${NC}"
    docker-compose down -v 2>/dev/null || docker compose down -v 2>/dev/null
    
    INIT_MODE=true
fi

# Start containers
echo -e "${GREEN}📦 Starting Docker containers...${NC}"
docker-compose up -d 2>/dev/null || docker compose up -d

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 10

# Wait for Directus to be ready
MAX_RETRIES=30
RETRY_COUNT=0
until curl -s http://localhost:8055/server/health > /dev/null 2>&1; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo -e "${RED}❌ Directus failed to start after ${MAX_RETRIES} attempts${NC}"
        exit 1
    fi
    echo "  Waiting for Directus... (attempt $RETRY_COUNT/$MAX_RETRIES)"
    sleep 3
done

echo -e "${GREEN}✅ Directus is ready!${NC}"

# Run schema setup if init mode
if [ "$INIT_MODE" = true ]; then
    echo -e "${GREEN}📝 Setting up Directus schema...${NC}"
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        echo -e "${RED}Error: Node.js is not installed. Please install Node.js to run schema setup.${NC}"
        echo -e "${YELLOW}You can manually run: node scripts/setup-directus-complete.js${NC}"
    else
        node scripts/setup-directus-complete.js
    fi
fi

# Build Next.js if needed
if [ -f "package.json" ]; then
    echo -e "${GREEN}🔨 Installing dependencies...${NC}"
    npm install --production=false
    
    echo -e "${GREEN}🏗️  Building Next.js app...${NC}"
    npm run build
fi

echo ""
echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}  Deployment Complete! 🎉${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""
echo -e "Services:"
echo -e "  📱 Next.js:  ${BLUE}http://localhost:3000${NC}"
echo -e "  📊 Directus: ${BLUE}http://localhost:8055${NC}"
echo -e ""
echo -e "Admin Login:"
echo -e "  Email: admin@apm-portal.id"
echo -e "  Password: Admin@APM2026!"
echo ""
echo -e "${YELLOW}⚠️  Remember to change admin password in production!${NC}"
echo ""

# Start Next.js in production mode
if [ "$UPDATE_MODE" = true ] || [ "$INIT_MODE" = true ]; then
    echo -e "${GREEN}🚀 Starting Next.js in production mode...${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
    npm run start
fi
