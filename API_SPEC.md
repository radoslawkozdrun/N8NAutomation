# API Specification - RSS Review Interface

Dokumentacja API wymagana do pełnej funkcjonalności interfejsu RSS Review.

## 🔗 Base URL

```
Production: https://your-domain.com/api
Development: http://localhost:8000/api
```

## 📝 Authentication

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

## 📊 Common Response Format

```typescript
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
```

## 📰 Articles Endpoints

### GET /articles
Pobiera listę artykułów z opcjonalnymi filtrami.

**Query Parameters:**
```typescript
interface ArticleQueryParams {
  page?: number;           // Default: 1
  limit?: number;          // Default: 20, Max: 100
  status?: string;         // NEW, PENDING_REVIEW, ACCEPTED, REJECTED, ARCHIVED
  category?: string;       // AI_ML, WEB_DEV, MOBILE_DEV, etc.
  priority?: string;       // P0_BREAKING, P1_TRENDING, etc.
  target_audience?: string; // developers, architects, managers, etc.
  score_min?: number;      // 0-100
  score_max?: number;      // 0-100
  search?: string;         // Search in title, content, tags
  tags?: string;           // Comma-separated tags
  sort_by?: string;        // final_score, created_date, priority
  sort_order?: string;     // asc, desc
}
```

**Example Request:**
```http
GET /api/articles?status=NEW&category=AI_ML&score_min=80&page=1&limit=20
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Advanced React Patterns in 2024",
      "author": "John Doe",
      "link": "https://example.com/article",
      "summary": "AI-generated summary of the article content...",
      "content": "Full article content...",
      "category": "WEB_DEV",
      "subcategory": "React",
      "tags": ["react", "patterns", "hooks", "performance"],
      "priority": "P1_TRENDING",
      "target_audience": "developers",
      "relevance_score": 90,
      "novelty_score": 80,
      "viral_score": 85,
      "value_score": 88,
      "final_score": 86,
      "key_takeaways": [
        "New React patterns improve performance",
        "Hooks composition patterns",
        "Advanced state management techniques"
      ],
      "reasoning": "High relevance due to React popularity, novel patterns discussed, high practical value for developers.",
      "status": "NEW",
      "created_date": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "total_pages": 8
  }
}
```

### GET /articles/{id}
Pobiera szczegóły pojedynczego artykułu.

**Example Request:**
```http
GET /api/articles/1
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "title": "Advanced React Patterns in 2024",
    // ... wszystkie pola artykułu
  },
  "success": true
}
```

### POST /articles/{id}/decision
Podejmuje decyzję o artykule (accept/reject/needs_more).

**Request Body:**
```typescript
interface ReviewDecision {
  action: 'accept' | 'reject' | 'needs_more';
  notes?: string;
}
```

**Example Request:**
```http
POST /api/articles/1/decision
Content-Type: application/json

{
  "action": "accept",
  "notes": "High quality content, relevant for our audience"
}
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "status": "ACCEPTED",
    // ... updated article data
  },
  "success": true,
  "message": "Article successfully accepted"
}
```

### POST /articles/bulk-update
Wykonuje bulk operations na wielu artykułach.

**Request Body:**
```typescript
interface BulkUpdateRequest {
  articleIds: number[];
  action: 'accept' | 'reject';
  notes?: string;
}
```

**Example Request:**
```http
POST /api/articles/bulk-update
Content-Type: application/json

{
  "articleIds": [1, 2, 3, 4, 5],
  "action": "accept",
  "notes": "Bulk approval of high-score articles"
}
```

**Response:**
```json
{
  "data": {
    "updated_count": 5,
    "failed_count": 0,
    "failed_ids": []
  },
  "success": true,
  "message": "5 articles successfully updated"
}
```

## 📊 Dashboard Endpoints

### GET /dashboard/stats
Pobiera statystyki dla dashboard.

**Example Request:**
```http
GET /api/dashboard/stats
```

**Response:**
```json
{
  "data": {
    "total_pending": 42,
    "average_score": 73.5,
    "category_distribution": {
      "AI_ML": 15,
      "WEB_DEV": 12,
      "MOBILE_DEV": 8,
      "DATA_SCIENCE": 5,
      "DEVOPS": 2
    },
    "priority_distribution": {
      "P0_BREAKING": 2,
      "P1_TRENDING": 8,
      "P2_TIMELY": 15,
      "P3_EVERGREEN": 12,
      "P4_FILLER": 5
    },
    "recent_activity": [
      {
        "id": "act_1",
        "action": "accepted",
        "article_title": "New React 19 Features",
        "timestamp": "2024-01-15T14:30:00Z",
        "user": "admin"
      }
    ]
  },
  "success": true
}
```

## 🏷️ Metadata Endpoints

### GET /articles/tags
Pobiera listę dostępnych tagów.

**Example Request:**
```http
GET /api/articles/tags
```

**Response:**
```json
{
  "data": [
    "react",
    "javascript",
    "typescript",
    "ai",
    "machine-learning",
    "web-development",
    "mobile",
    "ios",
    "android",
    "devops",
    "security"
  ],
  "success": true
}
```

### GET /articles/categories
Pobiera listę dostępnych kategorii.

**Example Request:**
```http
GET /api/articles/categories
```

**Response:**
```json
{
  "data": [
    "AI_ML",
    "WEB_DEV", 
    "MOBILE_DEV",
    "DATA_SCIENCE",
    "DEVOPS",
    "SECURITY",
    "CLOUD",
    "BLOCKCHAIN",
    "IOT",
    "OTHER"
  ],
  "success": true
}
```

## 🔍 Search Endpoint

### GET /articles/search
Zaawansowane wyszukiwanie artykułów.

**Query Parameters:**
```typescript
interface SearchParams {
  q: string;              // Search query
  fields?: string[];      // title, content, tags, author
  category?: string;
  priority?: string;
  score_min?: number;
  date_from?: string;     // ISO date
  date_to?: string;       // ISO date
  limit?: number;
}
```

**Example Request:**
```http
GET /api/articles/search?q=react hooks&fields=title,content&category=WEB_DEV&score_min=70
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Advanced React Hooks Patterns",
      "highlight": {
        "title": "Advanced <mark>React Hooks</mark> Patterns",
        "content": "Learn advanced <mark>React hooks</mark> techniques..."
      },
      // ... other article fields
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 8,
    "total_pages": 1
  }
}
```

## 🏥 Health Check

### GET /health
Sprawdza status aplikacji.

**Example Request:**
```http
GET /api/health
```

**Response:**
```json
{
  "data": {
    "status": "ok",
    "timestamp": "2024-01-15T15:30:00Z",
    "version": "1.0.0",
    "services": {
      "database": "ok",
      "ai_service": "ok",
      "rss_feeds": "ok"
    }
  },
  "success": true
}
```

## ❌ Error Responses

### Error Format
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Field 'action' is required",
    "Score must be between 0 and 100"
  ],
  "code": "VALIDATION_ERROR"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Unprocessable Entity
- `429` - Too Many Requests
- `500` - Internal Server Error
- `503` - Service Unavailable

### Common Error Codes
```typescript
interface ErrorCode {
  VALIDATION_ERROR: 'VALIDATION_ERROR';
  ARTICLE_NOT_FOUND: 'ARTICLE_NOT_FOUND';
  INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION';
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED';
  AI_SERVICE_UNAVAILABLE: 'AI_SERVICE_UNAVAILABLE';
}
```

## 🔒 Rate Limiting

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

**Limits:**
- General API: 1000 requests/hour
- Bulk operations: 100 requests/hour
- Search: 500 requests/hour

## 📡 Webhooks (Optional)

### POST /webhooks/article-processed
Webhook dla nowych przetworzonych artykułów.

**Request Body:**
```json
{
  "event": "article.processed",
  "data": {
    "id": 1,
    "title": "New Article Title",
    "final_score": 85,
    "status": "NEW"
  },
  "timestamp": "2024-01-15T15:30:00Z"
}
```

## 🧪 Testing Endpoints

### Postman Collection
```json
{
  "info": {
    "name": "RSS Review API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Articles",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{base_url}}/articles?status=NEW&limit=10",
          "host": ["{{base_url}}"],
          "path": ["articles"],
          "query": [
            {"key": "status", "value": "NEW"},
            {"key": "limit", "value": "10"}
          ]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:8000/api"
    }
  ]
}
```

### cURL Examples

**Get Articles:**
```bash
curl -X GET "http://localhost:8000/api/articles?status=NEW&limit=5" \
  -H "Content-Type: application/json"
```

**Accept Article:**
```bash
curl -X POST "http://localhost:8000/api/articles/1/decision" \
  -H "Content-Type: application/json" \
  -d '{"action": "accept", "notes": "Great content"}'
```

**Bulk Accept:**
```bash
curl -X POST "http://localhost:8000/api/articles/bulk-update" \
  -H "Content-Type: application/json" \
  -d '{"articleIds": [1,2,3], "action": "accept"}'
```

## 🔄 Database Schema Reference

### Articles Table
```sql
CREATE TABLE sp_content (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  author VARCHAR(200),
  link TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  category VARCHAR(50),
  subcategory VARCHAR(100),
  tags TEXT, -- JSON array or comma-separated
  priority VARCHAR(20),
  target_audience VARCHAR(50),
  relevance_score DECIMAL(5,2),
  novelty_score DECIMAL(5,2),
  viral_score DECIMAL(5,2),
  value_score DECIMAL(5,2),
  final_score DECIMAL(5,2),
  key_takeaways TEXT, -- JSON array or semicolon-separated
  reasoning TEXT,
  status VARCHAR(20) DEFAULT 'NEW',
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_by VARCHAR(100),
  reviewed_at TIMESTAMP,
  notes TEXT
);

-- Indexes for performance
CREATE INDEX idx_sp_content_status ON sp_content(status);
CREATE INDEX idx_sp_content_category ON sp_content(category);
CREATE INDEX idx_sp_content_score ON sp_content(final_score);
CREATE INDEX idx_sp_content_created ON sp_content(created_date);
```

## 🚀 Implementation Notes

### Backend Framework Recommendations
- **Node.js**: Express.js, Fastify, NestJS
- **Python**: FastAPI, Django REST, Flask
- **Go**: Gin, Fiber, Echo
- **Java**: Spring Boot
- **C#**: ASP.NET Core

### Database Considerations
- Use connection pooling
- Implement proper indexing
- Consider read replicas for heavy read loads
- Use JSONB for flexible fields (PostgreSQL)

### Performance Optimizations
- Implement caching (Redis)
- Use pagination for large datasets
- Add database query optimization
- Consider CDN for static assets
- Implement proper logging and monitoring

### Security Best Practices
- Use HTTPS only
- Implement proper CORS
- Add rate limiting
- Validate all inputs
- Use parameterized queries
- Implement proper authentication/authorization

---

**API Ready for Integration! 🚀**