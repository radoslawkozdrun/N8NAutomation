#!/bin/bash

# N8N Automation Deployment Script
# This script helps deploy the application to a VPS

set -e

echo "🚀 N8N Automation Deployment Script"
echo "===================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p ssl
mkdir -p logs

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚙️  Creating environment file..."
    cp .env.production .env
    echo "✅ Created .env file from .env.production template"
    echo "🔧 Please edit .env file with your production values before continuing"
    echo ""
    echo "Important values to update:"
    echo "- DB_PASSWORD: Set a secure database password"
    echo "- JWT_SECRET: Set a secure JWT secret (minimum 32 characters)"
    echo "- CORS_ORIGIN: Set your domain (e.g., https://yourdomain.com)"
    echo ""
    read -p "Press Enter after updating .env file to continue..."
fi

# Build and start services
echo "🔨 Building Docker images..."
docker-compose build --no-cache

echo "🐳 Starting services..."
docker-compose up -d postgres

echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "📊 Running database migrations..."
docker-compose exec postgres psql -U postgres -d rss_review -c "
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sp_posts (
    id SERIAL PRIMARY KEY,
    content_item_id INTEGER,
    title TEXT NOT NULL,
    content_body TEXT NOT NULL,
    platform VARCHAR(50) NOT NULL,
    hashtags TEXT[],
    status VARCHAR(50) DEFAULT 'DRAFT_CREATED',
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    rejection_reason TEXT
);
"

echo "👤 Creating admin user..."
docker-compose exec app node backend/scripts/create-admin.js

echo "🚀 Starting application..."
docker-compose up -d

echo "✅ Deployment complete!"
echo ""
echo "🌐 Application URLs:"
echo "   - Application: http://localhost:8002"
echo "   - Health check: http://localhost:8002/api/health"
echo ""
echo "📊 Useful commands:"
echo "   - View logs: docker-compose logs -f"
echo "   - Stop application: docker-compose down"
echo "   - Restart application: docker-compose restart"
echo "   - View running containers: docker-compose ps"
echo ""
echo "🔒 Security Notes:"
echo "   - Update your firewall to only allow necessary ports"
echo "   - Consider using SSL certificates for production"
echo "   - Regularly update your Docker images"
echo "   - Monitor your application logs"
echo ""

# Show running containers
echo "📋 Running containers:"
docker-compose ps