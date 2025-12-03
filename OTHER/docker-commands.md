# 🐳 Pure Docker Commands - N8N Automation

## Quick Deployment with Single Script

```bash
# Make script executable and run
chmod +x docker-deploy.sh
./docker-deploy.sh
```

## Manual Step-by-Step Commands

### 1. Create Docker Network

```bash
docker network create n8n-automation-network
```

### 2. Run PostgreSQL Database

```bash
# Create volume for persistent data
docker volume create n8n-postgres-data

# Run PostgreSQL container
docker run -d \
    --name n8n-automation-db \
    --network n8n-automation-network \
    --restart unless-stopped \
    -e POSTGRES_DB=rss_review \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD=your-secure-password \
    -v n8n-postgres-data:/var/lib/postgresql/data \
    -p 5432:5432 \
    postgres:15-alpine
```

### 3. Wait and Setup Database

```bash
# Wait for database to start
sleep 15

# Create tables
docker exec n8n-automation-db psql -U postgres -d rss_review << 'EOF'
CREATE TABLE IF NOT EXISTS "user" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

-- Create admin user (password: admin123)
INSERT INTO "user" (username, email, password_hash, role) 
VALUES ('admin', 'admin@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON CONFLICT (username) DO NOTHING;
EOF
```

### 4. Build Application Image

```bash
# Build the Docker image
docker build -t n8n-automation:latest .
```

### 5. Run Application Container

```bash
docker run -d \
    --name n8n-automation-app \
    --network n8n-automation-network \
    --restart unless-stopped \
    -e DB_HOST=n8n-automation-db \
    -e DB_PORT=5432 \
    -e DB_NAME=rss_review \
    -e DB_USER=postgres \
    -e DB_PASSWORD=your-secure-password \
    -e NODE_ENV=production \
    -e PORT=8002 \
    -e JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long \
    -e CORS_ORIGIN="*" \
    -p 8002:8002 \
    n8n-automation:latest
```

### 6. Verify Deployment

```bash
# Check if containers are running
docker ps

# Check application health
curl http://localhost:8002/api/health

# View application logs
docker logs n8n-automation-app -f
```

## Management Commands

### Container Management

```bash
# Start all containers
docker start n8n-automation-db
docker start n8n-automation-app

# Stop all containers
docker stop n8n-automation-app
docker stop n8n-automation-db

# Restart application
docker restart n8n-automation-app

# Remove containers (data will be preserved in volume)
docker rm n8n-automation-app n8n-automation-db

# Remove everything including data (⚠️ DESTRUCTIVE)
docker rm n8n-automation-app n8n-automation-db
docker volume rm n8n-postgres-data
docker network rm n8n-automation-network
```

### Monitoring

```bash
# View logs
docker logs n8n-automation-app -f
docker logs n8n-automation-db -f

# Check resource usage
docker stats

# Inspect containers
docker inspect n8n-automation-app
docker inspect n8n-automation-db
```

### Database Operations

```bash
# Connect to database
docker exec -it n8n-automation-db psql -U postgres -d rss_review

# Create backup
docker exec n8n-automation-db pg_dump -U postgres rss_review > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker exec -i n8n-automation-db psql -U postgres -d rss_review < backup.sql

# View database logs
docker logs n8n-automation-db
```

### Updates and Rebuilds

```bash
# Pull latest code
git pull origin develop

# Rebuild application
docker stop n8n-automation-app
docker rm n8n-automation-app
docker build -t n8n-automation:latest .

# Run new version
docker run -d \
    --name n8n-automation-app \
    --network n8n-automation-network \
    --restart unless-stopped \
    -e DB_HOST=n8n-automation-db \
    -e DB_PORT=5432 \
    -e DB_NAME=rss_review \
    -e DB_USER=postgres \
    -e DB_PASSWORD=your-secure-password \
    -e NODE_ENV=production \
    -e PORT=8002 \
    -e JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long \
    -e CORS_ORIGIN="*" \
    -p 8002:8002 \
    n8n-automation:latest
```

## Nginx Reverse Proxy (Optional)

```bash
# Create nginx config
mkdir -p ~/nginx-config
cat > ~/nginx-config/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server n8n-automation-app:8002;
    }

    server {
        listen 80;
        server_name _;

        location / {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF

# Run nginx
docker run -d \
    --name n8n-automation-nginx \
    --network n8n-automation-network \
    --restart unless-stopped \
    -p 80:80 \
    -v ~/nginx-config/nginx.conf:/etc/nginx/nginx.conf:ro \
    nginx:alpine
```

## Firewall Configuration

```bash
# UFW (Ubuntu)
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 8002  # Direct app access
sudo ufw enable

# Check status
sudo ufw status
```

## Troubleshooting

```bash
# Container not starting?
docker logs n8n-automation-app
docker logs n8n-automation-db

# Network issues?
docker network ls
docker network inspect n8n-automation-network

# Database connection issues?
docker exec n8n-automation-db pg_isready -U postgres -d rss_review

# Application health check
curl -v http://localhost:8002/api/health
```

## Environment Variables

Key variables you may need to customize:

```bash
-e DB_PASSWORD=your-secure-password           # Database password
-e JWT_SECRET=your-jwt-secret                 # JWT signing key
-e CORS_ORIGIN="https://yourdomain.com"       # CORS allowed origins
-e NODE_ENV=production                        # Environment
```

## Access Information

- **Application**: http://your-server-ip:8002
- **Admin Username**: admin
- **Admin Password**: admin123 (change immediately!)
- **Database**: localhost:5432
- **Health Check**: http://your-server-ip:8002/api/health