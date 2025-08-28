#!/bin/bash

echo "🚀 Deploying N8N Automation to Production..."

# Function to check if container exists
container_exists() {
    docker ps -a --format '{{.Names}}' | grep -Eq "^$1\$"
}

# Stop and remove existing app container if it exists
if container_exists "n8n-automation-app"; then
    echo "🛑 Stopping existing application container..."
    docker stop n8n-automation-app
    docker rm n8n-automation-app
fi

# Build new image
echo "🔧 Building application image..."
docker build -t n8n-automation:latest .

# Run new container with correct environment variables
echo "▶️ Starting new application container..."
docker run -d --name n8n-automation-app \
  --restart unless-stopped \
  -p 8002:8002 \
  -e DB_HOST=172.17.0.2 \
  -e DB_PORT=5432 \
  -e DB_NAME=postgres \
  -e DB_USER=postgres \
  -e DB_PASSWORD=1qaz@WSX \
  -e DB_SSL=false \
  -e NODE_ENV=production \
  -e PORT=8002 \
  -e FRONTEND_URL=${FRONTEND_URL:-http://localhost:3000} \
  n8n-automation:latest

# Wait for container to start
echo "⏳ Waiting for application to start..."
sleep 10

# Check logs
echo "📋 Application logs:"
docker logs n8n-automation-app --tail 20

# Test health endpoint
echo "🏥 Testing health endpoint..."
sleep 5
curl -f http://localhost:8002/api/health && echo "✅ Application is healthy!" || echo "❌ Health check failed"

echo "🎉 Deployment complete!"
echo "📍 Application URL: http://localhost:8002"
echo "🏥 Health check: http://localhost:8002/api/health"