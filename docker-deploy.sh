#!/bin/bash

# N8N Automation - Application Docker Deployment Script
# This script deploys only the application container to existing Docker infrastructure

set -e

echo "🐳 N8N Automation - Application Deployment"
echo "=========================================="

# Configuration
APP_NAME="n8n-automation"
NETWORK_NAME="n8n-network"
APP_CONTAINER="${APP_NAME}-app"

# Database configuration (existing PostgreSQL container)
# Based on docker-info.txt analysis: postgres:14.5 image is running
DB_HOST="postgresql"  # Existing PostgreSQL container name  
DB_NAME="postgres"
DB_USER="postgres"
DB_PASSWORD="1qaz@WSX"
JWT_SECRET="n8n-automation-app-jwt-key-a7b9c2d4e6f8g1h3i5j7k9l2m4n6p8q0r2s4t6u8v0w2x4y6z"

# Ports
APP_PORT="8002"

echo "🔧 Configuration:"
echo "   Network: ${NETWORK_NAME} (existing)"
echo "   Database: ${DB_HOST} (existing)"
echo "   Application: ${APP_CONTAINER}"
echo "   App Port: ${APP_PORT}"
echo ""

# Check if Docker is installed (try multiple possible paths on Windows)
DOCKER_CMD=""
if command -v docker &> /dev/null; then
    DOCKER_CMD="docker"
elif command -v docker.exe &> /dev/null; then
    DOCKER_CMD="docker.exe"
elif [ -f "/c/Program Files/Docker/Docker/resources/bin/docker.exe" ]; then
    DOCKER_CMD="/c/Program Files/Docker/Docker/resources/bin/docker.exe"
elif [ -f "/mnt/c/Program Files/Docker/Docker/resources/bin/docker.exe" ]; then
    DOCKER_CMD="/mnt/c/Program Files/Docker/Docker/resources/bin/docker.exe"
else
    echo "❌ Docker is not found. Please ensure Docker Desktop is installed and running."
    echo "   Try running this script from PowerShell or CMD instead of Git Bash."
    exit 1
fi

echo "✅ Found Docker at: ${DOCKER_CMD}"

# Create docker wrapper function
docker() {
    "${DOCKER_CMD}" "$@"
}

# Check if network exists
if ! docker network ls | grep -q ${NETWORK_NAME}; then
    echo "❌ Network ${NETWORK_NAME} does not exist. Please ensure n8n, traefik and postgresql are running."
    echo "   Expected running containers based on docker-info.txt:"
    echo "   - n8n (docker.n8n.io/n8nio/n8n:latest)"
    echo "   - traefik (traefik:latest)" 
    echo "   - postgresql (postgres:14.5)"
    echo "   - n8n-mcp (ghcr.io/czlonkowski/n8n-mcp:latest)"
    exit 1
fi

# Check if PostgreSQL container exists and is running
if ! docker ps | grep -q ${DB_HOST}; then
    echo "❌ PostgreSQL container '${DB_HOST}' is not running. Please ensure it's started."
    echo "   Expected: postgres:14.5 image running as 'postgresql' container"
    exit 1
fi

echo "✅ Found existing network: ${NETWORK_NAME}"
echo "✅ Found running PostgreSQL container: ${DB_HOST} (postgres:14.5)"

# Stop and remove existing application container if it exists
echo "🛑 Stopping existing application container..."
docker stop ${APP_CONTAINER} 2>/dev/null || true
docker rm ${APP_CONTAINER} 2>/dev/null || true

# Check database connection
echo "🔍 Checking database connection..."
for i in {1..10}; do
    if docker exec ${DB_HOST} pg_isready -U ${DB_USER} -d ${DB_NAME} > /dev/null 2>&1; then
        echo "✅ Database connection successful!"
        break
    fi
    if [ $i -eq 10 ]; then
        echo "❌ Database connection failed after 10 attempts"
        exit 1
    fi
    echo "   Attempt $i/10 - waiting..."
    sleep 2
done

# Build the application Docker image
echo "🔨 Building application Docker image..."
docker build -t ${APP_NAME}:latest .

# Run the application
echo "🚀 Starting application container..."
docker run -d \
    --name ${APP_CONTAINER} \
    --network ${NETWORK_NAME} \
    --restart unless-stopped \
    -e DB_HOST=${DB_HOST} \
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
echo "   - View db logs: docker logs ${DB_HOST} -f"
echo "   - Stop application: docker stop ${APP_CONTAINER}"
echo "   - Start application: docker start ${APP_CONTAINER}"
echo "   - Remove application: docker stop ${APP_CONTAINER} && docker rm ${APP_CONTAINER}"
echo ""
echo "📊 Container Status (all containers in ${NETWORK_NAME}):"
docker ps --filter "network=${NETWORK_NAME}" --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "💾 Database Access (PostgreSQL 14.5):"
echo "   - Connect: docker exec -it ${DB_HOST} psql -U ${DB_USER} -d ${DB_NAME}"
echo "   - Backup: docker exec ${DB_HOST} pg_dump -U ${DB_USER} ${DB_NAME} > backup.sql"
echo ""
echo "🔗 Other services in the network:"
echo "   - N8N: Available on port 5678 (docker.n8n.io/n8nio/n8n:latest)"
echo "   - Traefik: Available on port 80 (traefik:latest)"
echo "   - N8N-MCP: Available on port 3000 (ghcr.io/czlonkowski/n8n-mcp:latest)"
echo ""

# Show running containers
echo "🎉 Deployment successful! Your application is now running alongside existing services."