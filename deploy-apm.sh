#!/bin/bash

# APM Portal Deployment Script
# Usage: ./deploy-apm.sh

set -e

echo "🚀 Starting APM Portal deployment..."

# Check if Node.js and npm are installed
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    apt-get install -y nodejs
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    apt-get update
    apt-get install -y ca-certificates curl
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    chmod a+r /etc/apt/keyrings/docker.asc
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    systemctl start docker
    systemctl enable docker
fi

# Create directories
echo "📁 Creating project directories..."
mkdir -p /var/www/apm-portal
mkdir -p /var/www/apm-data/postgres

# Set permissions
chown -R www-data:www-data /var/www/apm-portal
chown -R 999:999 /var/www/apm-data/postgres

echo "✅ Prerequisites installed successfully!"
echo "📝 Next steps:"
echo "1. Upload your APM Portal code to /var/www/apm-portal"
echo "2. Run the docker-compose setup"
echo "3. Configure nginx"