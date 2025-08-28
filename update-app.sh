#!/bin/bash

echo "🔄 Updating N8N Automation Application..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command succeeded
check_command() {
    if [ $? -eq 0 ]; then
        print_success "$1"
    else
        print_error "$2"
        exit 1
    fi
}

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -f "docker-compose.yml" ]; then
    print_error "Not in the project directory. Please run this script from the N8NAutomation root directory."
    exit 1
fi

# Step 1: Pull latest changes from repository
print_status "📡 Pulling latest changes from repository..."
git pull origin develop
check_command "Repository updated successfully" "Failed to pull from repository"

# Step 2: Stop existing application container
print_status "🛑 Stopping existing application container..."
if docker ps | grep -q "n8n-automation-app"; then
    docker stop n8n-automation-app
    print_success "Application container stopped"
else
    print_warning "Application container was not running"
fi

# Step 3: Remove existing container
print_status "🗑️ Removing existing container..."
if docker ps -a | grep -q "n8n-automation-app"; then
    docker rm n8n-automation-app
    print_success "Container removed"
else
    print_warning "No existing container to remove"
fi

# Step 4: Remove old image to force rebuild
print_status "🔧 Removing old image..."
if docker images | grep -q "n8n-automation"; then
    docker rmi n8n-automation:latest 2>/dev/null || print_warning "Could not remove old image (may be in use)"
fi

# Step 5: Build new application image
print_status "🏗️ Building new application image..."
docker build -t n8n-automation:latest .
check_command "Application image built successfully" "Failed to build application image"

# Step 6: Start new application container
print_status "🚀 Starting new application container..."
docker run -d --name n8n-automation-app \
  --restart unless-stopped \
  -p 8002:8002 \
  -e DB_HOST=srv936559.hstgr.cloud \
  -e DB_PORT=5432 \
  -e DB_NAME=postgres \
  -e DB_USER=postgres \
  -e DB_PASSWORD=1qaz@WSX \
  -e DB_SSL=true \
  -e NODE_ENV=production \
  -e PORT=8002 \
  -e FRONTEND_URL=${FRONTEND_URL:-http://localhost:3000} \
  n8n-automation:latest

check_command "Application container started" "Failed to start application container"

# Step 7: Wait for application to initialize
print_status "⏳ Waiting for application to initialize..."
sleep 15

# Step 8: Check container status
print_status "📊 Checking container status..."
if docker ps | grep -q "n8n-automation-app"; then
    print_success "Container is running"
    
    # Show container info
    echo ""
    echo "📋 Container Information:"
    docker ps --filter "name=n8n-automation-app" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
else
    print_error "Container is not running"
    echo ""
    echo "📋 Container logs:"
    docker logs n8n-automation-app --tail 20
    exit 1
fi

# Step 9: Show recent logs
print_status "📋 Recent application logs:"
docker logs n8n-automation-app --tail 10

# Step 10: Test health endpoint
print_status "🏥 Testing application health..."
sleep 5

if curl -f -s http://localhost:8002/api/health > /dev/null 2>&1; then
    print_success "Application is healthy and responding!"
    echo ""
    echo "🎉 Update completed successfully!"
    echo "📍 Application URL: http://localhost:8002"
    echo "🏥 Health check: http://localhost:8002/api/health"
    echo "📊 Dashboard: http://localhost:8002/api/dashboard/stats"
else
    print_warning "Health check failed - application may still be starting"
    echo ""
    echo "⏳ You can check the status manually:"
    echo "   docker logs n8n-automation-app -f"
    echo "   curl http://localhost:8002/api/health"
fi

# Step 11: Clean up unused Docker resources
print_status "🧹 Cleaning up unused Docker resources..."
docker system prune -f > /dev/null 2>&1
print_success "Cleanup completed"

echo ""
print_success "🎊 Application update process completed!"
echo ""
echo "💡 Useful commands:"
echo "   View logs:     docker logs n8n-automation-app -f"
echo "   Stop app:      docker stop n8n-automation-app"  
echo "   Restart app:   docker restart n8n-automation-app"
echo "   App status:    docker ps | grep n8n-automation-app"