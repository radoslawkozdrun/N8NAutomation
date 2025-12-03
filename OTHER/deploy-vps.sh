#!/bin/bash

# N8N Automation - VPS Deployment Script
# This script deploys the application to VPS with external PostgreSQL database

set -e

echo "🌐 N8N Automation - VPS Deployment"
echo "=================================="

# Configuration
APP_NAME="n8n-automation"
APP_CONTAINER="${APP_NAME}-app"
COMPOSE_FILE="docker-compose-vps.yml"
ENV_FILE=".env.vps"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
echo "🔧 Checking prerequisites..."

if [ ! -f "$ENV_FILE" ]; then
    print_error "Environment file $ENV_FILE not found!"
    echo "Please copy .env.vps.example to .env.vps and configure it."
    exit 1
fi

if [ ! -f "$COMPOSE_FILE" ]; then
    print_error "Compose file $COMPOSE_FILE not found!"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed!"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed!"
    exit 1
fi

print_success "Prerequisites check passed"

# Load environment variables
print_status "Loading configuration from $ENV_FILE..."
source $ENV_FILE

# Test database connection
print_status "Testing database connection..."
if command -v nc &> /dev/null; then
    if nc -z $DB_HOST $DB_PORT; then
        print_success "Database connection test passed"
    else
        print_error "Cannot connect to database at $DB_HOST:$DB_PORT"
        exit 1
    fi
else
    print_warning "netcat not available, skipping database connection test"
fi

# Clean up old images and containers
print_status "Cleaning up old Docker resources..."
docker-compose -f $COMPOSE_FILE down || true
docker system prune -f || true
docker image rm n8n-automation:latest || true
docker image rm n8nautomation_app:latest || true

print_status "Building fresh application image..."
docker-compose -f $COMPOSE_FILE build --no-cache --pull

print_status "Starting application..."
docker-compose -f $COMPOSE_FILE up -d

# Wait for health check
print_status "Waiting for application to be healthy..."
TIMEOUT=60
COUNTER=0

while [ $COUNTER -lt $TIMEOUT ]; do
    if docker-compose -f $COMPOSE_FILE ps | grep -q "healthy"; then
        print_success "Application is healthy!"
        break
    fi
    
    if [ $COUNTER -eq $((TIMEOUT-1)) ]; then
        print_error "Application failed to become healthy within ${TIMEOUT} seconds"
        echo ""
        echo "Docker logs:"
        docker-compose -f $COMPOSE_FILE logs app
        exit 1
    fi
    
    sleep 1
    COUNTER=$((COUNTER+1))
    echo -n "."
done

echo ""

# Show status
print_status "Deployment completed!"
echo ""
echo "📊 Container Status:"
docker-compose -f $COMPOSE_FILE ps

echo ""
echo "🌐 Access URLs:"
echo "   Application: http://$(hostname -I | awk '{print $1}'):$PORT"
echo "   Health Check: http://$(hostname -I | awk '{print $1}'):$PORT/api/health"

echo ""
echo "📋 Useful Commands:"
echo "   View logs:    docker-compose -f $COMPOSE_FILE logs -f"
echo "   Stop app:     docker-compose -f $COMPOSE_FILE down"  
echo "   Restart app:  docker-compose -f $COMPOSE_FILE restart"
echo "   Shell access: docker-compose -f $COMPOSE_FILE exec app sh"

print_success "VPS deployment completed successfully!"