#!/bin/bash

# N8N Automation - VPS Management Script
# Central script for all VPS operations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${CYAN}================================${NC}"
    echo -e "${CYAN} N8N Automation - VPS Manager${NC}"
    echo -e "${CYAN}================================${NC}"
}

print_menu() {
    echo ""
    echo -e "${BLUE}Available Commands:${NC}"
    echo ""
    echo -e "${GREEN}📦 Deployment Commands:${NC}"
    echo "  deploy       - Deploy application to VPS (standard)"
    echo "  update       - Quick update (git pull + redeploy)"
    echo "  rebuild      - Force rebuild everything from scratch"
    echo ""
    echo -e "${GREEN}🔧 Management Commands:${NC}"
    echo "  status       - Show application status"
    echo "  logs         - Show application logs"
    echo "  restart      - Restart application containers"
    echo "  stop         - Stop application"
    echo "  health       - Check application health"
    echo ""
    echo -e "${GREEN}🧹 Maintenance Commands:${NC}"
    echo "  cleanup      - Clean Docker resources"
    echo "  backup       - Backup application data"
    echo "  shell        - Access application container shell"
    echo ""
    echo -e "${GREEN}ℹ️  Information Commands:${NC}"
    echo "  info         - Show deployment information"
    echo "  help         - Show this help menu"
    echo ""
}

print_info() {
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

# Configuration
COMPOSE_FILE="docker-compose-vps.yml"
ENV_FILE=".env.vps"

# Check prerequisites
check_prerequisites() {
    if [ ! -f "$COMPOSE_FILE" ]; then
        print_error "Docker Compose file $COMPOSE_FILE not found!"
        exit 1
    fi
    
    if [ ! -f "$ENV_FILE" ]; then
        print_error "Environment file $ENV_FILE not found!"
        exit 1
    fi
}

# Main command handler
case "${1:-help}" in
    "deploy")
        print_header
        print_info "Starting VPS deployment..."
        check_prerequisites
        ./deploy-vps.sh
        ;;
    
    "update") 
        print_header
        print_info "Starting quick VPS update..."
        check_prerequisites
        ./update-vps.sh
        ;;
    
    "rebuild")
        print_header
        print_info "Starting force rebuild..."
        check_prerequisites  
        ./rebuild-vps.sh
        ;;
    
    "status")
        print_header
        print_info "Checking application status..."
        docker-compose -f $COMPOSE_FILE ps
        ;;
    
    "logs")
        print_header
        print_info "Showing application logs..."
        docker-compose -f $COMPOSE_FILE logs -f
        ;;
    
    "restart")
        print_header
        print_info "Restarting application..."
        docker-compose -f $COMPOSE_FILE restart
        print_success "Application restarted"
        ;;
    
    "stop")
        print_header
        print_info "Stopping application..."
        docker-compose -f $COMPOSE_FILE down
        print_success "Application stopped"
        ;;
    
    "health")
        print_header
        print_info "Checking application health..."
        if curl -f http://localhost:8002/api/health > /dev/null 2>&1; then
            print_success "Application is healthy"
            curl -s http://localhost:8002/api/health | jq '.' || curl -s http://localhost:8002/api/health
        else
            print_error "Application health check failed"
            exit 1
        fi
        ;;
    
    "cleanup")
        print_header
        print_info "Cleaning Docker resources..."
        docker-compose -f $COMPOSE_FILE down
        docker system prune -f
        docker volume prune -f
        print_success "Cleanup completed"
        ;;
    
    "backup")
        print_header
        print_info "Creating backup..."
        BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
        mkdir -p $BACKUP_DIR
        cp -r dist/ $BACKUP_DIR/ 2>/dev/null || true
        cp $ENV_FILE $BACKUP_DIR/
        cp $COMPOSE_FILE $BACKUP_DIR/
        print_success "Backup created in $BACKUP_DIR"
        ;;
    
    "shell")
        print_header
        print_info "Accessing application container..."
        docker-compose -f $COMPOSE_FILE exec app sh
        ;;
    
    "info")
        print_header
        echo -e "${BLUE}📋 VPS Deployment Information:${NC}"
        echo ""
        echo "🌐 Application URL: http://$(hostname -I | awk '{print $1}' 2>/dev/null || echo 'localhost'):8002"
        echo "🔧 Health Check: http://localhost:8002/api/health"
        echo "📁 Compose File: $COMPOSE_FILE"
        echo "⚙️  Environment: $ENV_FILE"
        echo "📦 Container Status:"
        docker-compose -f $COMPOSE_FILE ps 2>/dev/null || echo "   No containers running"
        echo ""
        ;;
    
    "help"|*)
        print_header
        print_menu
        echo ""
        echo -e "${YELLOW}Usage:${NC}"
        echo "  ./vps-manager.sh <command>"
        echo ""  
        echo -e "${YELLOW}Examples:${NC}"
        echo "  ./vps-manager.sh deploy     # Deploy to VPS"
        echo "  ./vps-manager.sh update     # Quick update"
        echo "  ./vps-manager.sh status     # Check status"
        echo "  ./vps-manager.sh logs       # View logs"
        echo ""
        ;;
esac