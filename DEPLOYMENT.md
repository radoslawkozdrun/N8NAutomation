# Deployment Guide - RSS Review Interface

Przewodnik wdrożenia aplikacji RSS Review Interface dla różnych środowisk.

## 📋 Przygotowanie do Wdrożenia

### 1. Sprawdzenie Wymagań
```bash
# Sprawdź wersję Node.js (wymagane 18+)
node --version

# Sprawdź wersję npm
npm --version

# Zainstaluj dependencies
npm ci --production=false
```

### 2. Build Production
```bash
# Stwórz optimized build
npm run build

# Sprawdź rozmiar bundle
du -sh dist/

# Opcjonalnie: preview build lokalnie
npm run preview
```

### 3. Environment Variables
Utwórz odpowiednie pliki środowiskowe:

**Production (.env.production)**
```env
VITE_API_URL=https://your-api-domain.com/api
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_OFFLINE_MODE=false
VITE_DEBUG_MODE=false
```

**Staging (.env.staging)**
```env
VITE_API_URL=https://staging-api-domain.com/api
VITE_ENABLE_ANALYTICS=false
VITE_DEBUG_MODE=true
```

## 🚀 Opcje Wdrożenia

### Option 1: Vercel (Recommended)

**Automatyczne Deployment z Git**
1. Push kod do GitHub/GitLab
2. Połącz repository z Vercel
3. Skonfiguruj environment variables w Vercel dashboard
4. Automatyczne deployment na każdy push

**Manual Deployment**
```bash
# Zainstaluj Vercel CLI
npm i -g vercel

# Login do Vercel
vercel login

# Deploy
vercel --prod

# Skonfiguruj custom domain (opcjonalnie)
vercel domains add your-domain.com
```

**vercel.json Configuration**
```json
{
  "functions": {
    "app/api/**/*.js": {
      "maxDuration": 30
    }
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Option 2: Netlify

**Netlify CLI**
```bash
# Zainstaluj Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist

# Lub użyj drag & drop w Netlify dashboard
```

**netlify.toml Configuration**
```toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Option 3: AWS S3 + CloudFront

**1. Build i Upload do S3**
```bash
# Build aplikacji
npm run build

# Upload do S3 (wymagane AWS CLI)
aws s3 sync dist/ s3://your-bucket-name --delete

# Skonfiguruj static website hosting
aws s3 website s3://your-bucket-name \
  --index-document index.html \
  --error-document index.html
```

**2. CloudFront Configuration**
```json
{
  "Origins": [
    {
      "DomainName": "your-bucket.s3.amazonaws.com",
      "Id": "S3-your-bucket",
      "S3OriginConfig": {
        "OriginAccessIdentity": ""
      }
    }
  ],
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-your-bucket",
    "ViewerProtocolPolicy": "redirect-to-https",
    "Compress": true
  },
  "CustomErrorResponses": [
    {
      "ErrorCode": 404,
      "ResponsePagePath": "/index.html",
      "ResponseCode": 200
    }
  ]
}
```

### Option 4: Docker Deployment

**Dockerfile**
```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf**
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache static assets
        location /static/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }
}
```

**Docker Commands**
```bash
# Build image
docker build -t rss-review-interface .

# Run container
docker run -p 8080:80 rss-review-interface

# Docker Compose (docker-compose.yml)
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8080:80"
    environment:
      - NODE_ENV=production
```

### Option 5: Traditional Server (Apache/Nginx)

**Apache .htaccess**
```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>
```

**Nginx Configuration**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/rss-review-interface;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Handle SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

## 🔒 Security Considerations

### 1. Environment Variables Security
```bash
# Nigdy nie commituj .env files
echo ".env*" >> .gitignore

# Użyj secrets management
# Vercel: Environment Variables w dashboard
# AWS: Systems Manager Parameter Store
# Docker: Docker secrets
```

### 2. API Security
```typescript
// Zawsze sprawdzaj CORS configuration
const allowedOrigins = [
  'https://your-domain.com',
  'https://staging.your-domain.com'
];

// Implementuj rate limiting na API
// Użyj HTTPS tylko
// Sprawdź authentication tokens
```

### 3. Content Security Policy
```html
<!-- Dodaj do index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:; 
               connect-src 'self' https://your-api-domain.com;">
```

## 📊 Monitoring & Analytics

### 1. Performance Monitoring
```typescript
// src/lib/monitoring.ts
export function initMonitoring() {
  // Web Vitals
  if ('web-vital' in window) {
    // Implement Web Vitals tracking
  }
  
  // Error tracking
  window.addEventListener('error', (event) => {
    // Send to monitoring service
  });
}
```

### 2. Analytics Setup
```typescript
// src/lib/analytics.ts
export function trackEvent(event: string, properties: object) {
  if (import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
    // Google Analytics, Mixpanel, etc.
  }
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## 🧪 Health Checks

### Application Health Check
```typescript
// src/lib/health.ts
export async function healthCheck() {
  try {
    const response = await fetch('/api/health');
    return response.ok;
  } catch {
    return false;
  }
}

// Implement in app
useEffect(() => {
  const interval = setInterval(async () => {
    const healthy = await healthCheck();
    if (!healthy) {
      // Show connection error banner
    }
  }, 30000);
  
  return () => clearInterval(interval);
}, []);
```

### Monitoring Endpoints
```bash
# Add to monitoring system
GET /health - Application health
GET /api/health - API health
GET /metrics - Application metrics (if implemented)
```

## 🚨 Troubleshooting Deployment

### Common Issues

**1. Build Failures**
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run build
```

**2. Environment Variables Not Working**
```bash
# Verify environment variables are set
console.log(import.meta.env.VITE_API_URL);

# Check naming (must start with VITE_)
# Restart development server after changes
```

**3. Routing Issues (404 on Refresh)**
```bash
# Ensure server is configured for SPA
# Check nginx/apache configuration
# Verify index.html fallback is working
```

**4. API Connection Issues**
```bash
# Check CORS configuration on API
# Verify API URL is correct
# Check network tab in browser dev tools
# Ensure API is accessible from deployment environment
```

### Performance Issues
```bash
# Analyze bundle size
npm run build
npx webpack-bundle-analyzer dist/

# Check lighthouse scores
npx lighthouse-ci autorun

# Monitor Core Web Vitals
# Implement performance monitoring
```

## 📞 Support

W przypadku problemów z wdrożeniem:

1. Sprawdź deployment logs
2. Sprawdź browser console errors
3. Sprawdź network connectivity do API
4. Sprawdź environment variables configuration
5. Utwórz Issue w repository z szczegółami problemu

---

**Successfully deployed! 🎉**