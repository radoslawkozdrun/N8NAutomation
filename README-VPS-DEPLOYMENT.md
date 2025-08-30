# 🌐 VPS Deployment Guide

## Przygotowanie do wdrożenia na VPS z zewnętrzną bazą danych

### 📋 Wymagania VPS

- Docker & Docker Compose
- Dostęp do zewnętrznej bazy PostgreSQL
- Porty: 8002 (aplikacja)
- Minimum 512MB RAM, 1 CPU core

### 🔧 Konfiguracja

#### 1. Pliki konfiguracyjne dla VPS

**Konfiguracja środowiskowa:** `.env.vps`
```env
# Zewnętrzna baza danych
DB_HOST=srv936559.hstgr.cloud
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=1qaz@WSX

# Aplikacja
NODE_ENV=production
PORT=8002
JWT_SECRET=n8n-automation-super-secret-jwt-key-for-vps-production-2024

# CORS
CORS_ORIGIN=http://srv936559.hstgr.cloud:8002
```

**Docker Compose:** `docker-compose-vps.yml`
- Tylko kontener aplikacji (bez lokalnej bazy)
- Połączenie z zewnętrzną bazą PostgreSQL
- Health checks i monitoring

#### 2. Skrypty deployment

**Automatyczny deployment:** `deploy-vps.sh`
```bash
./deploy-vps.sh
```

**Funkcje skryptu:**
- ✅ Sprawdzenie połączenia z bazą
- ✅ Budowanie obrazu Docker
- ✅ Health checks
- ✅ Monitoring statusu
- ✅ Restart przy błędach

### 🚀 Wdrożenie

#### Opcja 1: Automatyczny skrypt (zalecane)
```bash
# 1. Skopiuj pliki na VPS
scp -r ./* user@your-vps:/path/to/app/

# 2. Uruchom deployment  
ssh user@your-vps "cd /path/to/app && ./deploy-vps.sh"
```

#### Opcja 2: Ręczny deployment
```bash
# Na VPS
docker-compose -f docker-compose-vps.yml down
docker-compose -f docker-compose-vps.yml build --no-cache  
docker-compose -f docker-compose-vps.yml up -d
```

### 🌐 Dostęp po wdrożeniu

- **Aplikacja:** http://srv936559.hstgr.cloud:8002
- **Health Check:** http://srv936559.hstgr.cloud:8002/api/health
- **Login:** admin / 1qaz@WSX

### 📊 Monitoring i zarządzanie

#### Sprawdzenie statusu
```bash
docker-compose -f docker-compose-vps.yml ps
docker-compose -f docker-compose-vps.yml logs -f
```

#### Restart aplikacji
```bash
docker-compose -f docker-compose-vps.yml restart app
```

#### Aktualizacja aplikacji
```bash
git pull
./deploy-vps.sh
```

### 🔍 Rozwiązywanie problemów

#### Baza danych
```bash
# Test połączenia z bazą
nc -z srv936559.hstgr.cloud 5432

# Sprawdzenie logów
docker logs n8n-automation-app
```

#### Health check
```bash
curl http://localhost:8002/api/health
```

#### Restart całego stosu
```bash
docker-compose -f docker-compose-vps.yml down
docker system prune -f
./deploy-vps.sh
```

### 📁 Struktura plików dla VPS

```
├── .env.vps                    # Konfiguracja VPS
├── docker-compose-vps.yml      # Docker Compose dla VPS
├── deploy-vps.sh              # Skrypt deployment
├── Dockerfile                 # Budowanie obrazu
├── backend/                   # Kod backendu
├── dist/                      # Zbudowany frontend
└── README-VPS-DEPLOYMENT.md   # Ta dokumentacja
```

### ⚠️ Różnice między środowiskami

| Aspekt | Lokalny development | VPS Production |
|--------|-------------------|----------------|
| Frontend | `npm run dev` (port 3000) | Statyczne pliki w Docker |
| Backend | `npm run dev:api` (port 8002) | Docker kontener (port 8002) |
| Baza | Zewnętrzna (srv936559.hstgr.cloud) | Ta sama zewnętrzna baza |
| Hot reload | ✅ Tak | ❌ Nie |
| Build | ❌ Nie potrzebny | ✅ `npm run build` |

### 🔄 Proces aktualizacji

1. **Lokalnie:** Przetestuj zmiany z `npm run dev`
2. **Build:** `npm run build` 
3. **Commit:** `git commit && git push`
4. **VPS:** `git pull && ./deploy-vps.sh`

### 💡 Najlepsze praktyki

- ✅ Zawsze testuj lokalnie przed wdrożeniem
- ✅ Używaj automatycznego skryptu deployment
- ✅ Monitoruj logi po wdrożeniu
- ✅ Rób backup bazy przed większymi zmianami
- ✅ Używaj health checks do monitoringu