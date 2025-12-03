#!/bin/bash

# N8N Automation - Quick VPS Update Script
# This script pulls latest code and redeploys the application

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

echo "🔄 N8N Automation - Quick VPS Update"
echo "===================================="

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_error "This is not a git repository!"
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes in the repository"
    echo "Uncommitted changes:"
    git status --short
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Update cancelled"
        exit 1
    fi
fi

# Pull latest changes
print_status "Pulling latest changes from repository..."
git fetch origin
git pull origin develop

# Check if there are any changes
if [ $? -ne 0 ]; then
    print_error "Failed to pull changes from repository"
    exit 1
fi

print_success "Repository updated successfully"

# Build fresh frontend
print_status "Building fresh frontend..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Frontend build failed"
    exit 1
fi

print_success "Frontend build completed"

# Deploy to VPS
print_status "Deploying to VPS..."
./deploy-vps.sh

print_success "VPS update completed successfully!"

echo ""
echo "🌐 Your application should now be updated at:"
echo "   http://$(hostname -I | awk '{print $1}'):8002"
echo ""
echo "📋 Next steps:"
echo "   1. Test the login page (should not show default credentials)"  
echo "   2. Verify all functionality works as expected"
echo "   3. Check application logs if needed:"
echo "      docker-compose -f docker-compose-vps.yml logs -f"