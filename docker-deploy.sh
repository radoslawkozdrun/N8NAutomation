#!/bin/bash

# N8N Automation - Pure Docker Deployment Script
# This script deploys the application using only Docker commands (no docker-compose)

set -e

echo "🐳 N8N Automation - Docker Deployment"
echo "====================================="

# Configuration
APP_NAME="n8n-automation"
NETWORK_NAME="${APP_NAME}-network"
DB_CONTAINER="${APP_NAME}-db"
APP_CONTAINER="${APP_NAME}-app"
NGINX_CONTAINER="${APP_NAME}-nginx"

# Database configuration
DB_NAME="rss_review"
DB_USER="postgres"
DB_PASSWORD="your-secure-db-password-here"
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters-long"

# Ports
DB_PORT="5432"
APP_PORT="8002"
HTTP_PORT="80"
HTTPS_PORT="443"

echo "🔧 Configuration:"
echo "   Network: ${NETWORK_NAME}"
echo "   Database: ${DB_CONTAINER}"
echo "   Application: ${APP_CONTAINER}"
echo "   App Port: ${APP_PORT}"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Stop and remove existing containers
echo "🛑 Stopping existing containers..."
docker stop ${DB_CONTAINER} ${APP_CONTAINER} ${NGINX_CONTAINER} 2>/dev/null || true
docker rm ${DB_CONTAINER} ${APP_CONTAINER} ${NGINX_CONTAINER} 2>/dev/null || true

# Remove existing network
echo "🌐 Removing existing network..."
docker network rm ${NETWORK_NAME} 2>/dev/null || true

# Create Docker network
echo "🌐 Creating Docker network..."
docker network create ${NETWORK_NAME}

# Create volume for database
echo "💾 Creating database volume..."
docker volume create ${APP_NAME}-postgres-data 2>/dev/null || true

# Run PostgreSQL database
echo "🗄️ Starting PostgreSQL database..."
docker run -d \
    --name ${DB_CONTAINER} \
    --network ${NETWORK_NAME} \
    --restart unless-stopped \
    -e POSTGRES_DB=${DB_NAME} \
    -e POSTGRES_USER=${DB_USER} \
    -e POSTGRES_PASSWORD=${DB_PASSWORD} \
    -e PGDATA=/var/lib/postgresql/data/pgdata \
    -v ${APP_NAME}-postgres-data:/var/lib/postgresql/data \
    -p ${DB_PORT}:5432 \
    postgres:15-alpine

echo "⏳ Waiting for database to start..."
sleep 15

# Check database connection
echo "🔍 Checking database connection..."
for i in {1..30}; do
    if docker exec ${DB_CONTAINER} pg_isready -U ${DB_USER} -d ${DB_NAME} > /dev/null 2>&1; then
        echo "✅ Database is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Database failed to start after 30 attempts"
        exit 1
    fi
    echo "   Attempt $i/30 - waiting..."
    sleep 2
done

# Create database tables
echo "📊 Creating database tables..."
docker exec ${DB_CONTAINER} psql -U ${DB_USER} -d ${DB_NAME} << 'EOF'
-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create posts table
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

-- Create sp_content table if it doesn't exist (for articles)
CREATE TABLE IF NOT EXISTS sp_content (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    author VARCHAR(255),
    link TEXT,
    summary TEXT,
    content TEXT,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    tags TEXT,
    priority VARCHAR(50),
    target_audience VARCHAR(50),
    relevance_score DECIMAL(5,2),
    novelty_score DECIMAL(5,2),
    viral_score DECIMAL(5,2),
    value_score DECIMAL(5,2),
    final_score DECIMAL(5,2),
    key_takeways TEXT,
    reasoning TEXT,
    status VARCHAR(50) DEFAULT 'PENDING_REVIEW',
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create research table
CREATE TABLE IF NOT EXISTS sp_research (
    id SERIAL PRIMARY KEY,
    article_id INTEGER REFERENCES sp_content(id),
    search_id VARCHAR(255),
    source_url TEXT,
    research_type VARCHAR(100),
    content TEXT,
    author VARCHAR(255),
    title TEXT,
    publication_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample admin user (password: admin123)
INSERT INTO users (username, email, password_hash, role) 
VALUES ('admin', 'admin@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert some sample data
INSERT INTO sp_content (title, author, summary, status, final_score) 
VALUES 
('Sample Article 1', 'John Doe', 'This is a sample article for testing purposes', 'PENDING_REVIEW', 85.5),
('Sample Article 2', 'Jane Smith', 'Another sample article for the application', 'RESEARCH_DONE', 78.2)
ON CONFLICT DO NOTHING;
EOF

echo "✅ Database tables created successfully!"

# Build the application Docker image
echo "🔨 Building application Docker image..."
docker build -t ${APP_NAME}:latest .

# Run the application
echo "🚀 Starting application container..."
docker run -d \
    --name ${APP_CONTAINER} \
    --network ${NETWORK_NAME} \
    --restart unless-stopped \
    -e DB_HOST=${DB_CONTAINER} \
    -e DB_PORT=5432 \
    -e DB_NAME=${DB_NAME} \
    -e DB_USER=${DB_USER} \
    -e DB_PASSWORD=${DB_PASSWORD} \
    -e NODE_ENV=production \
    -e PORT=8002 \
    -e JWT_SECRET="${JWT_SECRET}" \
    -e CORS_ORIGIN="*" \
    -p ${APP_PORT}:8002 \
    ${APP_NAME}:latest

echo "⏳ Waiting for application to start..."
sleep 10

# Health check
echo "🔍 Checking application health..."
for i in {1..20}; do
    if curl -f http://localhost:${APP_PORT}/api/health > /dev/null 2>&1; then
        echo "✅ Application is healthy!"
        break
    fi
    if [ $i -eq 20 ]; then
        echo "❌ Application health check failed after 20 attempts"
        echo "📋 Application logs:"
        docker logs ${APP_CONTAINER} --tail 50
        exit 1
    fi
    echo "   Attempt $i/20 - waiting..."
    sleep 3
done

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "🌐 Application URLs:"
echo "   - Application: http://$(curl -s ifconfig.me):${APP_PORT}"
echo "   - Local: http://localhost:${APP_PORT}"
echo "   - Health check: http://localhost:${APP_PORT}/api/health"
echo ""
echo "👤 Admin Login:"
echo "   - Username: admin"
echo "   - Password: admin123"
echo "   - ⚠️  Please change the password after first login!"
echo ""
echo "🔧 Management Commands:"
echo "   - View app logs: docker logs ${APP_CONTAINER} -f"
echo "   - View db logs: docker logs ${DB_CONTAINER} -f"
echo "   - Stop application: docker stop ${APP_CONTAINER} ${DB_CONTAINER}"
echo "   - Start application: docker start ${DB_CONTAINER} && docker start ${APP_CONTAINER}"
echo "   - Remove all: docker stop ${APP_CONTAINER} ${DB_CONTAINER} && docker rm ${APP_CONTAINER} ${DB_CONTAINER}"
echo ""
echo "📊 Container Status:"
docker ps --filter "network=${NETWORK_NAME}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "💾 Database Access:"
echo "   - Connect: docker exec -it ${DB_CONTAINER} psql -U ${DB_USER} -d ${DB_NAME}"
echo "   - Backup: docker exec ${DB_CONTAINER} pg_dump -U ${DB_USER} ${DB_NAME} > backup.sql"
echo ""

# Show running containers
echo "🎉 Deployment successful! Your application is now running."