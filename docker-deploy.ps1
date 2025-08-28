# N8N Automation - Application Docker Deployment Script (PowerShell)
# This script deploys only the application container to existing Docker infrastructure

# Configuration
$APP_NAME = "n8n-automation"
$NETWORK_NAME = "n8n-network"
$APP_CONTAINER = "$APP_NAME-app"

# Database configuration (existing PostgreSQL container)
# Based on docker-info.txt analysis: postgres:14.5 image is running
$DB_HOST = "postgresql"  # Existing PostgreSQL container name
$DB_NAME = "postgres"
$DB_USER = "postgres"
$DB_PASSWORD = "1qaz@WSX"
$JWT_SECRET = "n8n-automation-app-jwt-key-a7b9c2d4e6f8g1h3i5j7k9l2m4n6p8q0r2s4t6u8v0w2x4y6z"

# Ports
$APP_PORT = "8002"

Write-Host "🐳 N8N Automation - Application Deployment" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔧 Configuration:" -ForegroundColor Yellow
Write-Host "   Network: $NETWORK_NAME (existing)" -ForegroundColor White
Write-Host "   Database: $DB_HOST (existing)" -ForegroundColor White
Write-Host "   Application: $APP_CONTAINER" -ForegroundColor White
Write-Host "   App Port: $APP_PORT" -ForegroundColor White
Write-Host ""

# Check if Docker is installed
try {
    docker --version | Out-Null
    Write-Host "✅ Docker is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed or not running. Please install Docker Desktop and ensure it's running." -ForegroundColor Red
    exit 1
}

# Check if network exists
try {
    $networks = docker network ls --format "{{.Name}}"
    if ($networks -notcontains $NETWORK_NAME) {
        Write-Host "❌ Network $NETWORK_NAME does not exist. Please ensure n8n, traefik and postgresql are running." -ForegroundColor Red
        Write-Host "   Expected running containers based on docker-info.txt:" -ForegroundColor Yellow
        Write-Host "   - n8n (docker.n8n.io/n8nio/n8n:latest)" -ForegroundColor White
        Write-Host "   - traefik (traefik:latest)" -ForegroundColor White
        Write-Host "   - postgresql (postgres:14.5)" -ForegroundColor White
        Write-Host "   - n8n-mcp (ghcr.io/czlonkowski/n8n-mcp:latest)" -ForegroundColor White
        exit 1
    }
    Write-Host "✅ Found existing network: $NETWORK_NAME" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to check Docker networks" -ForegroundColor Red
    exit 1
}

# Check if PostgreSQL container exists and is running
try {
    $containers = docker ps --format "{{.Names}}"
    if ($containers -notcontains $DB_HOST) {
        Write-Host "❌ PostgreSQL container '$DB_HOST' is not running. Please ensure it's started." -ForegroundColor Red
        Write-Host "   Expected: postgres:14.5 image running as 'postgresql' container" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✅ Found running PostgreSQL container: $DB_HOST (postgres:14.5)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to check running containers" -ForegroundColor Red
    exit 1
}

# Stop and remove existing application container if it exists
Write-Host ""
Write-Host "🛑 Stopping existing application container..." -ForegroundColor Yellow
try {
    docker stop $APP_CONTAINER 2>$null
    docker rm $APP_CONTAINER 2>$null
} catch {
    # Container might not exist, which is fine
}

# Check database connection
Write-Host "🔍 Checking database connection..." -ForegroundColor Yellow
$connected = $false
for ($i = 1; $i -le 10; $i++) {
    try {
        docker exec $DB_HOST pg_isready -U $DB_USER -d $DB_NAME | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Database connection successful!" -ForegroundColor Green
            $connected = $true
            break
        }
    } catch {
        # Continue trying
    }
    
    if ($i -eq 10) {
        Write-Host "❌ Database connection failed after 10 attempts" -ForegroundColor Red
        exit 1
    }
    Write-Host "   Attempt $i/10 - waiting..." -ForegroundColor Gray
    Start-Sleep -Seconds 2
}

# Build the application Docker image
Write-Host ""
Write-Host "🔨 Building application Docker image..." -ForegroundColor Yellow
try {
    docker build -t "$APP_NAME`:latest" .
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to build Docker image" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Failed to build Docker image" -ForegroundColor Red
    exit 1
}

# Run the application
Write-Host ""
Write-Host "🚀 Starting application container..." -ForegroundColor Yellow
try {
    docker run -d `
        --name $APP_CONTAINER `
        --network $NETWORK_NAME `
        --restart unless-stopped `
        -e DB_HOST=$DB_HOST `
        -e DB_PORT=5432 `
        -e DB_NAME=$DB_NAME `
        -e DB_USER=$DB_USER `
        -e DB_PASSWORD=$DB_PASSWORD `
        -e NODE_ENV=production `
        -e PORT=8002 `
        -e JWT_SECRET="$JWT_SECRET" `
        -e CORS_ORIGIN="*" `
        -p "$APP_PORT`:8002" `
        "$APP_NAME`:latest"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to start application container" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Failed to start application container" -ForegroundColor Red
    exit 1
}

Write-Host "⏳ Waiting for application to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Health check
Write-Host "🔍 Checking application health..." -ForegroundColor Yellow
$healthy = $false
for ($i = 1; $i -le 20; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$APP_PORT/api/health" -UseBasicParsing -TimeoutSec 3
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Application is healthy!" -ForegroundColor Green
            $healthy = $true
            break
        }
    } catch {
        # Continue trying
    }
    
    if ($i -eq 20) {
        Write-Host "❌ Application health check failed after 20 attempts" -ForegroundColor Red
        Write-Host "📋 Application logs:" -ForegroundColor Yellow
        docker logs $APP_CONTAINER --tail 50
        exit 1
    }
    Write-Host "   Attempt $i/20 - waiting..." -ForegroundColor Gray
    Start-Sleep -Seconds 3
}

Write-Host ""
Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Application URLs:" -ForegroundColor Cyan
Write-Host "   - Local: http://localhost:$APP_PORT" -ForegroundColor White
Write-Host "   - Health check: http://localhost:$APP_PORT/api/health" -ForegroundColor White
Write-Host ""
Write-Host "👤 Admin Login:" -ForegroundColor Cyan
Write-Host "   - Username: admin" -ForegroundColor White
Write-Host "   - Password: admin123" -ForegroundColor White
Write-Host "   - ⚠️  Please change the password after first login!" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔧 Management Commands:" -ForegroundColor Cyan
Write-Host "   - View app logs: docker logs $APP_CONTAINER -f" -ForegroundColor White
Write-Host "   - View db logs: docker logs $DB_HOST -f" -ForegroundColor White
Write-Host "   - Stop application: docker stop $APP_CONTAINER" -ForegroundColor White
Write-Host "   - Start application: docker start $APP_CONTAINER" -ForegroundColor White
Write-Host "   - Remove application: docker stop $APP_CONTAINER; docker rm $APP_CONTAINER" -ForegroundColor White
Write-Host ""
Write-Host "📊 Container Status (all containers in $NETWORK_NAME):" -ForegroundColor Cyan
docker ps --filter "network=$NETWORK_NAME" --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
Write-Host ""
Write-Host "💾 Database Access (PostgreSQL 14.5):" -ForegroundColor Cyan
Write-Host "   - Connect: docker exec -it $DB_HOST psql -U $DB_USER -d $DB_NAME" -ForegroundColor White
Write-Host "   - Backup: docker exec $DB_HOST pg_dump -U $DB_USER $DB_NAME > backup.sql" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Other services in the network:" -ForegroundColor Cyan
Write-Host "   - N8N: Available on port 5678 (docker.n8n.io/n8nio/n8n:latest)" -ForegroundColor White
Write-Host "   - Traefik: Available on port 80 (traefik:latest)" -ForegroundColor White
Write-Host "   - N8N-MCP: Available on port 3000 (ghcr.io/czlonkowski/n8n-mcp:latest)" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Deployment successful! Your application is now running alongside existing services." -ForegroundColor Green