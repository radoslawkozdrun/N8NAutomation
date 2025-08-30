#!/bin/bash

# N8N Automation - Force Rebuild VPS Script  
# This script completely rebuilds everything from scratch

set -e

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

echo "🔨 N8N Automation - Force Rebuild VPS"
echo "====================================="
echo ""
print_warning "This will completely rebuild everything from scratch!"
print_warning "This may take several minutes and will cause downtime."
echo ""

read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_error "Rebuild cancelled"
    exit 1
fi

COMPOSE_FILE="docker-compose-vps.yml"

# Step 1: Clean local build
print_status "Cleaning local build artifacts..."
rm -rf dist/ || true
rm -rf node_modules/.cache || true
rm -rf backend/node_modules/.cache || true

# Step 2: Rebuild frontend locally first
print_status "Installing fresh frontend dependencies..."
npm ci

print_status "Building fresh frontend..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Frontend build failed"
    exit 1
fi

print_success "Fresh frontend build completed"

# Step 3: Complete Docker cleanup
print_status "Performing complete Docker cleanup..."
docker-compose -f $COMPOSE_FILE down || true
docker system prune -af || true
docker volume prune -f || true

# Remove specific images
print_status "Removing application-specific Docker images..."
docker image rm n8n-automation:latest || true
docker image rm n8nautomation_app:latest || true
docker image rm $(docker images -q --filter "reference=*n8n*") || true

# Step 4: Rebuild everything
print_status "Rebuilding Docker image from scratch..."
docker-compose -f $COMPOSE_FILE build --no-cache --pull

# Step 5: Start application
print_status "Starting fresh application container..."
docker-compose -f $COMPOSE_FILE up -d

# Step 6: Wait for health check
print_status "Waiting for application to become healthy..."
TIMEOUT=120
COUNTER=0

while [ $COUNTER -lt $TIMEOUT ]; do
    if docker-compose -f $COMPOSE_FILE ps | grep -q "healthy"; then
        print_success "Application is healthy!"
        break
    fi
    
    if [ $COUNTER -eq $((TIMEOUT-1)) ]; then
        print_error "Application failed to become healthy within ${TIMEOUT} seconds"
        echo ""
        print_status "Checking container status..."
        docker-compose -f $COMPOSE_FILE ps
        echo ""
        print_status "Container logs:"
        docker-compose -f $COMPOSE_FILE logs --tail=50 app
        exit 1
    fi
    
    sleep 2
    COUNTER=$((COUNTER+2))
    if [ $((COUNTER % 10)) -eq 0 ]; then
        echo -n " ${COUNTER}s"
    else
        echo -n "."
    fi
done

echo ""

# Step 7: Verify deployment
print_status "Verifying deployment..."
sleep 5

print_status "Testing application endpoints..."
if curl -f http://localhost:8002/api/health > /dev/null 2>&1; then
    print_success "Health check endpoint is working"
else
    print_warning "Health check endpoint may not be responding"
fi

# Final status
echo ""
print_success "Force rebuild completed successfully!"
echo ""
echo "📊 Final Status:"
docker-compose -f $COMPOSE_FILE ps

echo ""
echo "🌐 Access URLs:"
echo "   Application: http://$(hostname -I | awk '{print $1}'):8002"
echo "   Health Check: http://$(hostname -I | awk '{print $1}'):8002/api/health"

echo ""
echo "🔍 Verification Commands:"
echo "   View logs:    docker-compose -f $COMPOSE_FILE logs -f"
echo "   Check status: docker-compose -f $COMPOSE_FILE ps"
echo "   Test login:   curl http://localhost:8002/"

print_success "Application should now be running with the latest code!"

echo ""
print_warning "IMPORTANT: Test the login page to ensure default credentials are removed!"