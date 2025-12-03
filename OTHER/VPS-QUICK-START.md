# 🚀 VPS Quick Start Guide

## Problem: Strona logowania na VPS pokazuje stare informacje o admin123

### ⚡ Natychmiastowe rozwiązanie:

```bash
# Na VPS uruchom to polecenie:
./vps-manager.sh rebuild
```

To zagwarantuje kompletne przebudowanie aplikacji z najnowszym kodem (bez informacji o domyślnym haśle).

---

## 📋 Dostępne skrypty VPS

### 🎯 Główny manager (zalecany):
```bash
./vps-manager.sh <command>
```

**Dostępne komendy:**
- `deploy` - Standardowy deployment
- `update` - Szybka aktualizacja (git pull + redeploy)  
- `rebuild` - **Pełne przebudowanie od zera** ⭐
- `status` - Status kontenerów
- `logs` - Podgląd logów
- `restart` - Restart aplikacji
- `health` - Test zdrowia aplikacji

### 🔨 Specjalistyczne skrypty:

**1. Szybka aktualizacja:**
```bash
./update-vps.sh
```
- Git pull najnowszego kodu
- Rebuilding frontendu
- Redeploy aplikacji

**2. Force rebuild (gdy coś nie działa):**
```bash
./rebuild-vps.sh
```
- Kompletne czyszczenie Docker cache
- Przebudowanie wszystkiego od zera
- Gwarancja świeżej instalacji

**3. Standardowy deployment:**
```bash
./deploy-vps.sh
```
- Podstawowy deployment z cleanup

---

## 🎯 Rozwiązanie problemu ze stroną logowania:

### Opcja 1: Manager (najłatwiejsza)
```bash
./vps-manager.sh rebuild
```

### Opcja 2: Krok po kroku
```bash
# 1. Aktualizuj kod
git pull

# 2. Force rebuild
./rebuild-vps.sh

# 3. Sprawdź status
./vps-manager.sh status

# 4. Test aplikacji
./vps-manager.sh health
```

### Opcja 3: Ręcznie
```bash
# Zatrzymaj wszystko
docker-compose -f docker-compose-vps.yml down

# Wyczyść Docker
docker system prune -af

# Zbuduj nowo
npm run build
docker-compose -f docker-compose-vps.yml build --no-cache

# Uruchom
docker-compose -f docker-compose-vps.yml up -d
```

---

## ✅ Weryfikacja po deployment:

1. **Sprawdź status:**
   ```bash
   ./vps-manager.sh status
   ```

2. **Test health:**
   ```bash
   curl http://localhost:8002/api/health
   ```

3. **Sprawdź stronę logowania:**
   ```bash
   curl http://localhost:8002/ | grep -i admin123 || echo "✅ OK - brak domyślnych danych"
   ```

4. **Podejrzyj w przeglądarce:**
   - http://srv936559.hstgr.cloud:8002
   - Strona logowania nie powinna pokazywać informacji o admin123

---

## 🔍 Rozwiązywanie problemów:

### Problem: Aplikacja nie uruchamia się
```bash
./vps-manager.sh logs
```

### Problem: Stara wersja nadal widoczna
```bash
# Force cleanup + rebuild
docker system prune -af
./rebuild-vps.sh
```

### Problem: Błędy bazy danych
```bash
# Test połączenia z bazą
nc -z srv936559.hstgr.cloud 5432
```

---

## 📊 Monitoring:

**Przydatne komendy:**
```bash
./vps-manager.sh info     # Pokaż informacje o deployment
./vps-manager.sh status   # Status kontenerów  
./vps-manager.sh health   # Test API
./vps-manager.sh logs     # Logi aplikacji (Ctrl+C aby wyjść)
```

---

## 🎯 Najważniejsze:

**Jeśli strona logowania na VPS nadal pokazuje admin123, uruchom:**

```bash
./vps-manager.sh rebuild
```

**To zagwarantuje świeży build bez domyślnych danych logowania!** ✅