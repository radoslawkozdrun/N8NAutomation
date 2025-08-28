#!/bin/bash

# N8N Automation - Application Docker Deployment Script
# This script deploys only the application container to existing Docker infrastructure

set -e

echo "🐳 N8N Automation - Application Deployment"
echo "=========================================="

# Configuration
APP_NAME="n8n-automation"
NETWORK_NAME="root_default"  # Based on networks.txt analysis
APP_CONTAINER="${APP_NAME}-app"

# Database configuration (existing PostgreSQL container)
# Based on networks.txt analysis: my-postgres container in bridge network
DB_HOST="my-postgres"  # Actual PostgreSQL container name from networks.txt
DB_NAME="postgres"
DB_USER="postgres"
DB_PASSWORD="1qaz@WSX"
JWT_SECRET="n8n-automation-app-jwt-key-a7b9c2d4e6f8g1h3i5j7k9l2m4n6p8q0r2s4t6u8v0w2x4y6z"

# Ports
APP_PORT="8002"

echo "🔧 Configuration:"
echo "   Target Network: ${NETWORK_NAME} (existing - contains n8n and traefik)"
echo "   Database: ${DB_HOST} (in bridge network)"
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

# Check if target network exists
if ! "${DOCKER_CMD}" network ls | grep -q ${NETWORK_NAME}; then
    echo "❌ Network ${NETWORK_NAME} does not exist. Please ensure n8n and traefik are running."
    echo "   Expected network structure based on networks.txt:"
    echo "   - root_default: contains root-traefik-1 and root-n8n-1"
    echo "   - bridge: contains my-postgres"
    exit 1
fi

# Check if PostgreSQL container exists and is running (it's in bridge network)
if ! "${DOCKER_CMD}" ps | grep -q ${DB_HOST}; then
    echo "❌ PostgreSQL container '${DB_HOST}' is not running. Please ensure it's started."
    echo "   Expected: postgres container named 'my-postgres' in bridge network"
    exit 1
fi

echo "✅ Found existing network: ${NETWORK_NAME} (contains n8n and traefik)"
echo "✅ Found running PostgreSQL container: ${DB_HOST} (in bridge network)"

# Stop and remove existing application container if it exists
echo "🛑 Stopping existing application container..."
"${DOCKER_CMD}" stop ${APP_CONTAINER} 2>/dev/null || true
"${DOCKER_CMD}" rm ${APP_CONTAINER} 2>/dev/null || true

# Check database connection
echo "🔍 Checking database connection..."
for i in {1..10}; do
    if "${DOCKER_CMD}" exec ${DB_HOST} pg_isready -U ${DB_USER} -d ${DB_NAME} > /dev/null 2>&1; then
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
"${DOCKER_CMD}" build -t ${APP_NAME}:latest .

# Run the application
echo "🚀 Starting application container..."
echo "   Note: Application will be in ${NETWORK_NAME} network"
echo "   Database connectivity: Application will connect to ${DB_HOST} via Docker's internal networking"

# First create the container in the target network
"${DOCKER_CMD}" run -d \
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

# Connect the application container to bridge network to access database
echo "🔗 Connecting application to bridge network for database access..."
"${DOCKER_CMD}" network connect bridge ${APP_CONTAINER}

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
        "${DOCKER_CMD}" logs ${APP_CONTAINER} --tail 50
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
echo "   - View app logs: ${DOCKER_CMD} logs ${APP_CONTAINER} -f"
echo "   - View db logs: ${DOCKER_CMD} logs ${DB_HOST} -f"  
echo "   - Stop application: ${DOCKER_CMD} stop ${APP_CONTAINER}"
echo "   - Start application: ${DOCKER_CMD} start ${APP_CONTAINER}"
echo "   - Remove application: ${DOCKER_CMD} stop ${APP_CONTAINER} && ${DOCKER_CMD} rm ${APP_CONTAINER}"
echo "   - Check networks: ${DOCKER_CMD} network ls"
echo "   - Inspect app networks: ${DOCKER_CMD} inspect ${APP_CONTAINER} | grep -A 20 'Networks'"
echo ""
echo "📊 Container Status (all containers in ${NETWORK_NAME}):"
"${DOCKER_CMD}" ps --filter "network=${NETWORK_NAME}" --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "💾 Database Access (PostgreSQL 14.5):"
echo "   - Connect: ${DOCKER_CMD} exec -it ${DB_HOST} psql -U ${DB_USER} -d ${DB_NAME}"
echo "   - Backup: ${DOCKER_CMD} exec ${DB_HOST} pg_dump -U ${DB_USER} ${DB_NAME} > backup.sql"
echo ""
echo "🔗 Network topology based on networks.txt:"
echo "   - root_default network: ${APP_CONTAINER}, root-n8n-1, root-traefik-1"
echo "   - bridge network: ${APP_CONTAINER}, my-postgres"
echo "   - N8N: Available on port 5678 (root-n8n-1 container)"
echo "   - Traefik: Available on port 80 (root-traefik-1 container)"
echo "   - PostgreSQL: Available as my-postgres in bridge network"
echo ""

# Show running containers
echo "🎉 Deployment successful! Your application is now running alongside existing services."