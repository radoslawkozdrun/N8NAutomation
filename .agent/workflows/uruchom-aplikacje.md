---
description: Jak uruchomić aplikację RSS Review Interface
---

# Uruchomienie Aplikacji RSS Review Interface

Aplikacja składa się z trzech głównych komponentów:
- **Frontend** (React + Vite) - interfejs użytkownika
- **Backend** (Node.js + Express) - API serwer
- **Database** (PostgreSQL) - baza danych

## Opcja 1: Development (Lokalne uruchomienie)

### Krok 1: Sprawdź wymagania
```bash
node --version  # Powinno być >= 18.0.0
npm --version   # Powinno być >= 9.0.0
```

### Krok 2: Przygotuj bazę danych PostgreSQL

Musisz mieć uruchomiony PostgreSQL. Możesz użyć:
- Lokalnej instalacji PostgreSQL
- Docker: `docker run --name postgres -e POSTGRES_PASSWORD=yourpassword -p 5432:5432 -d postgres:14.5`

### Krok 3: Skonfiguruj Backend

```bash
cd backend
```

Utwórz plik `.env` w katalogu `backend` (jeśli nie istnieje):
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rss_review
DB_USER=postgres
DB_PASSWORD=yourpassword

# Server
PORT=8000
NODE_ENV=development

# JWT (opcjonalne dla auth)
JWT_SECRET=your-secret-key-change-in-production

# CORS
CORS_ORIGIN=http://localhost:5173
```

Zainstaluj zależności i uruchom migracje:
```bash
npm install
# Uruchom migracje bazy danych (jeśli są skrypty)
# npm run migrate
```

// turbo
Uruchom backend:
```bash
npm run dev
```

Backend będzie dostępny pod: `http://localhost:8000`

### Krok 4: Skonfiguruj Frontend

Otwórz nowy terminal i przejdź do głównego katalogu:
```bash
cd c:\Data\03_Repozytoria\N8NAutomation
```

Utwórz plik `.env.local` w głównym katalogu:
```env
VITE_API_URL=http://localhost:8000/api
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_OFFLINE_MODE=false
```

Zainstaluj zależności:
```bash
npm install
```

// turbo
Uruchom frontend:
```bash
npm run dev
```

Frontend będzie dostępny pod: `http://localhost:5173`

### Krok 5: Otwórz aplikację

Otwórz przeglądarkę i przejdź do: `http://localhost:5173`

---

## Opcja 2: Production (Docker Compose)

### Krok 1: Przygotuj environment variables

Przejdź do katalogu z docker-compose:
```bash
cd OTHER/test
```

Utwórz plik `.env`:
```env
# Domain Configuration
DOMAIN_NAME=yourdomain.com
SUBDOMAIN=n8n

# SSL
SSL_EMAIL=your-email@example.com

# PostgreSQL
POSTGRES_PASSWORD=strong-password-here

# Timezone
GENERIC_TIMEZONE=Europe/Warsaw

# MCP Server (jeśli używasz)
COMPOSIO_API_KEY=your-api-key
COMPOSIO_MCP_ENDPOINT=your-endpoint
COMPOSIO_USER_ID=your-user-id
MCP_API_KEY=your-mcp-api-key
RECIPIENT_EMAIL=your-email@example.com
```

### Krok 2: Utwórz wymagane volumes

```bash
docker volume create traefik_data
docker volume create n8n_data
docker volume create postgres-volume
```

### Krok 3: Uruchom Docker Compose

// turbo
```bash
docker-compose up -d
```

### Krok 4: Sprawdź status

```bash
docker-compose ps
docker-compose logs -f
```

### Krok 5: Dostęp do aplikacji

- n8n: `https://n8n.yourdomain.com`
- MCP Server: `https://mcp.yourdomain.com`
- Traefik Dashboard: `http://your-server-ip:8080`

---

## Opcja 3: Tylko Backend API (bez frontendu)

Jeśli chcesz uruchomić tylko backend API:

```bash
cd backend
npm install
npm run start:api
```

API będzie dostępne pod: `http://localhost:8000/api`

---

## Troubleshooting

### Problem: Backend nie łączy się z bazą danych
**Rozwiązanie:**
1. Sprawdź czy PostgreSQL działa: `docker ps` lub `pg_isready`
2. Zweryfikuj credentials w pliku `.env`
3. Sprawdź logi: `docker-compose logs postgres`

### Problem: Frontend nie łączy się z backendem
**Rozwiązanie:**
1. Sprawdź czy backend działa: `curl http://localhost:8000/api/health`
2. Zweryfikuj `VITE_API_URL` w `.env.local`
3. Sprawdź CORS w backend - `CORS_ORIGIN` powinien zawierać adres frontendu

### Problem: Port już zajęty
**Rozwiązanie:**
1. Frontend (5173): Zmień port w `vite.config.ts` lub zabij proces: `netstat -ano | findstr :5173`
2. Backend (8000): Zmień `PORT` w `backend/.env`
3. PostgreSQL (5432): Zmień mapowanie portu w docker-compose.yml

### Problem: Błędy TypeScript podczas build
**Rozwiązanie:**
```bash
# Wyczyść cache i przebuduj
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Problem: Docker Compose - kontenery nie startują
**Rozwiązanie:**
1. Sprawdź logi: `docker-compose logs`
2. Zweryfikuj volumes: `docker volume ls`
3. Sprawdź DNS dla domen (jeśli używasz SSL)
4. Upewnij się że porty 80 i 443 są wolne

---

## Szybkie Komendy

### Development
```bash
# Start wszystkiego (2 terminale)
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
npm run dev
```

### Production Build
```bash
# Build frontend
npm run build

# Preview production build
npm run preview
```

### Docker
```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Restart
docker-compose restart

# Logi
docker-compose logs -f [service-name]

# Rebuild
docker-compose up -d --build
```

---

## Następne Kroki

Po uruchomieniu aplikacji:
1. Sprawdź Dashboard - `http://localhost:5173`
2. Zweryfikuj połączenie z API - sprawdź Network tab w DevTools
3. Zapoznaj się z keyboard shortcuts (naciśnij `?` w aplikacji)
4. Przejrzyj dokumentację API w `README.md`
