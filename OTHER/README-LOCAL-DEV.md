# 🚀 Local Development Setup

## Najlepsze praktyki - rozdzielone środowisko

### Struktura:
```
Frontend (Vite dev server)  ← http://localhost:3000
Backend (Express API only)  ← http://localhost:8002
```

## 📋 Wymagania

- Node.js 16+
- npm
- PostgreSQL (zewnętrzna lub lokalna)

## 🔧 Konfiguracja

### 1. Zależności
```bash
# Root (frontend)
npm install

# Backend
cd backend
npm install
```

### 2. Zmienne środowiskowe

**Frontend (.env.local):**
```env
VITE_API_URL=http://localhost:8002/api
VITE_DEBUG_MODE=true
```

**Backend (backend/.env):**
```env
DB_HOST=srv936559.hstgr.cloud
DB_PORT=5432
DB_NAME=postgres  
DB_USER=postgres
DB_PASSWORD=1qaz@WSX
PORT=8002
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## 🚀 Uruchomienie

### Opcja 1: Automatyczny skrypt

**Windows:**
```cmd
start-local-dev.bat
```

**Linux/Mac:**
```bash
./start-local-dev.sh
```

### Opcja 2: Ręcznie (2 terminale)

**Terminal 1 - Backend API:**
```bash
cd backend
npm run dev:api
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## 🌐 Dostęp

- **Aplikacja:** http://localhost:3000
- **API:** http://localhost:8002
- **Health check:** http://localhost:8002/api/health

## 📊 Tryby pracy

### Development (rozdzielone)
- ✅ Hot reload dla frontendu i backendu
- ✅ Lepsze logowanie błędów  
- ✅ Oddzielne skalowanie
- ✅ Szybsze przeładowanie

### Production (zintegrowane)
```bash
npm run build
cd backend  
npm start    # Serwuje API + statyki na porcie 8002
```

## 🔧 Dostępne komendy

### Frontend
```bash
npm run dev        # Vite dev server (port 3000)
npm run build      # Budowanie do /dist
npm run preview    # Podgląd zbudowanej wersji
```

### Backend  
```bash
npm run dev        # Server + statyki (port 8002)
npm run dev:api    # Tylko API (port 8002) 
npm run start      # Produkcja z statycznymi plikami
npm run start:api  # Produkcja tylko API
```

## 🐛 Rozwiązywanie problemów

### Port zajęty
```bash
# Sprawdź co używa portu
netstat -ano | findstr :3000
netstat -ano | findstr :8002

# Zabij proces (Windows)
taskkill /PID <PID> /F
```

### CORS błędy
- Upewnij się że backend działa na porcie 8002
- Sprawdź VITE_API_URL w .env.local
- Backend automatycznie akceptuje localhost:3000

### Baza danych
```bash
# Test połączenia
cd backend
node -e "require('./database').testConnection()"
```

## 💡 Zalety tego podejścia

- **Rozwój:** Szybkie przeładowanie, niezależne serwery
- **Debugging:** Łatwiejsze debugowanie każdej warstwy
- **Skalowanie:** Można skalować frontend i backend osobno
- **CI/CD:** Lepsze dla pipeline'ów deploymentowych
- **CDN:** Frontend można łatwo serwować przez CDN