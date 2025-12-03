# 🎯 Automated Frontend Testing System

## Przegląd

Ten system automatycznie testuje frontend przed deploymentem, wychwytując błędy JavaScript/TypeScript, problemy z konsolą i inne potencjalne problemy **zanim** kod trafi do produkcji.

## 🎭 Komponenty systemu

### 1. Playwright MCP Server
- Uruchamia headless Chrome
- Przechwytuje błędy konsoli
- Nagrywa video z testów
- Generuje execution traces

### 2. Test Scripts
- `test-frontend.bat` (Windows)
- `test-frontend.sh` (Linux/Mac)
- `scripts/test-frontend.js` (Node.js)

### 3. Raporty
- `test-report.html` - Wizualny raport
- `test-results.json` - Dane strukturalne
- `test-output.log` - Pełne logi
- `trace.zip` - Playwright trace
- `video.webm` - Nagranie testu

## 🚀 Szybki start

### Instalacja

```bash
# 1. Zainstaluj Playwright MCP
npm install -g @playwright/mcp@latest

# 2. Sprawdź czy MCP jest skonfigurowane w Claude Desktop
cat .mcp.json
```

### Pierwsze uruchomienie

```bash
# Windows
test-frontend.bat

# Linux/Mac
chmod +x test-frontend.sh
./test-frontend.sh

# Lub przez npm
npm run test:frontend
```

### Integracja z Vibe Coding

Powiedz Claude:
```
Przed zakończeniem pracy z Vibe Coding, użyj Playwright MCP do przetestowania frontendu i upewnij się że nie ma błędów konsoli.
```

## 📊 Co jest testowane?

| Test | Opis | Krytyczny? |
|------|------|------------|
| **TypeScript Compilation** | Czy kod się kompiluje bez błędów | ✅ TAK |
| **Dev Server Start** | Czy serwer deweloperski startuje | ✅ TAK |
| **Console Errors** | Czy są błędy JavaScript w konsoli | ✅ TAK |
| **Console Warnings** | Czy są ostrzeżenia w konsoli | ⚠️ Zalecane |
| **Page Load** | Czy strona się ładuje | ✅ TAK |
| **Performance** | Czas ładowania strony | ℹ️ Info |

## 📁 Struktura plików

```
.
├── .mcp.json                          # Konfiguracja MCP servers
├── test-frontend.bat                  # Test script (Windows)
├── test-frontend.sh                   # Test script (Linux/Mac)
├── scripts/
│   └── test-frontend.js              # Node.js test runner
├── playwright-reports/                # Folder z raportami (gitignored)
│   ├── test-report.html              # 🎨 Główny raport
│   ├── test-results.json             # 📊 Dane JSON
│   ├── test-output.log               # 📜 Logi
│   ├── test-console-errors.js        # 🔧 Init script
│   ├── trace.zip                     # 🔍 Playwright trace
│   └── video.webm                    # 🎥 Video recording
├── PLAYWRIGHT-GUIDE.md                # Pełna dokumentacja
└── VIBE-CODING-QUICKSTART.md         # Quick start guide
```

## 🔧 Konfiguracja

### `.mcp.json` - Dostępne serwery MCP

#### `playwright-test` (Headless)
Automatyczne testowanie bez widocznej przeglądarki:
```json
{
  "command": "npx",
  "args": [
    "@playwright/mcp@latest",
    "--browser", "chrome",
    "--caps", "vision",
    "--headless",
    "--ignore-https-errors",
    "--timeout-action", "10000",
    "--timeout-navigation", "30000",
    "--save-trace",
    "--save-video", "1280x720",
    "--output-dir", "./playwright-reports"
  ]
}
```

#### `playwright-dev` (Headed)
Testowanie z widoczną przeglądarką do debugowania:
```json
{
  "command": "npx",
  "args": [
    "@playwright/mcp@latest",
    "--browser", "chrome",
    "--caps", "vision",
    "--timeout-action", "10000",
    "--timeout-navigation", "30000",
    "--viewport-size", "1920x1080"
  ]
}
```

## 💡 Przykłady użycia

### 1. Podstawowe testowanie

```bash
# Uruchom wszystkie testy
npm run test:frontend

# Zobacz raport
start playwright-reports/test-report.html  # Windows
open playwright-reports/test-report.html   # Mac
xdg-open playwright-reports/test-report.html  # Linux
```

### 2. Tylko kompilacja TypeScript

```bash
npm run test:quick
```

### 3. Debug mode z widoczną przeglądarką

```bash
npx @playwright/mcp@latest \
  --browser chrome \
  navigate http://localhost:3000
```

### 4. Testowanie na różnych urządzeniach

```bash
# iPhone 15
npx @playwright/mcp@latest \
  --device "iPhone 15" \
  --viewport-size 390x844 \
  navigate http://localhost:3000

# iPad Pro
npx @playwright/mcp@latest \
  --device "iPad Pro" \
  --viewport-size 1024x1366 \
  navigate http://localhost:3000
```

## 🔄 Workflow

### Development Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  1. Zmień kod w projekcie                                   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Uruchom: npm run test:frontend                          │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Sprawdź raport HTML                                     │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
         ┌───────┴───────┐
         │               │
         ▼               ▼
    ✅ PASS          ❌ FAIL
         │               │
         │               ▼
         │      ┌────────────────────┐
         │      │ Napraw błędy       │
         │      └────────┬───────────┘
         │               │
         │               ▼
         │      ┌────────────────────┐
         │      │ Powrót do kroku 2  │
         │      └────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Commit & Push                                           │
└─────────────────────────────────────────────────────────────┘
```

### Vibe Coding Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  Claude (użytkownik): "Dodaj nową funkcję X"               │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  Vibe Coding: Modyfikuje pliki                             │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  Claude: "Użyj playwright-test MCP do weryfikacji"         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  MCP: Uruchamia testy automatycznie                        │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
         ┌───────┴───────┐
         │               │
         ▼               ▼
    ✅ PASS          ❌ BŁĘDY
         │               │
         │               ▼
         │      ┌────────────────────┐
         │      │ Claude: Napraw     │
         │      │ błędy automatycznie│
         │      └────────┬───────────┘
         │               │
         │               ▼
         │      ┌────────────────────┐
         │      │ Ponowny test       │
         │      └────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  Gotowe do commitu!                                         │
└─────────────────────────────────────────────────────────────┘
```

## 🐛 Troubleshooting

### Problem: Port 3000 zajęty

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

### Problem: Playwright MCP nie działa

```bash
# Reinstall
npm uninstall -g @playwright/mcp
npm install -g @playwright/mcp@latest

# Sprawdź wersję
npx @playwright/mcp@latest --version
```

### Problem: Brak uprawnień do wykonania skryptu (Linux/Mac)

```bash
chmod +x test-frontend.sh
chmod +x scripts/test-frontend.js
```

### Problem: Test timeout

Zwiększ timeout w `.mcp.json`:
```json
"--timeout-navigation", "60000"  // 60 sekund
```

## 📈 Metryki i raporty

### HTML Report
Najbardziej przejrzysty raport z:
- Statusem każdego testu
- Listą błędów konsoli
- Listą ostrzeżeń
- Metrykami performance
- Linkami do trace i video

### JSON Results
Strukturalne dane do dalszej analizy:
```json
{
  "timestamp": "2025-09-30T12:00:00.000Z",
  "steps": [
    {
      "name": "TypeScript Compilation",
      "status": "success"
    }
  ],
  "testResults": {
    "errors": [],
    "warnings": [],
    "performance": {
      "loadTime": 1234
    }
  }
}
```

### Playwright Trace
Otwórz na [trace.playwright.dev](https://trace.playwright.dev):
- Każda akcja w przeglądarce
- Network requests
- Console logs
- Screenshots dla każdego kroku

## 🎓 Best Practices

### ✅ Zawsze rób przed commitowaniem
```bash
npm run test:frontend && git commit -m "Feature X"
```

### ✅ Używaj w pre-commit hook
```bash
# .git/hooks/pre-commit
#!/bin/bash
npm run test:frontend || exit 1
```

### ✅ Integruj z CI/CD
```yaml
# .github/workflows/test.yml
- name: Frontend Tests
  run: npm run test:frontend
```

### ✅ Zachowuj trace dla bugów
Gdy znajdziesz bug, zachowaj:
- `trace.zip`
- `video.webm`
- `test-output.log`

## 🔗 Linki

- [Playwright Documentation](https://playwright.dev)
- [Playwright MCP GitHub](https://github.com/microsoft/playwright-mcp)
- [Playwright Trace Viewer](https://trace.playwright.dev)
- [PLAYWRIGHT-GUIDE.md](./PLAYWRIGHT-GUIDE.md) - Pełna dokumentacja
- [VIBE-CODING-QUICKSTART.md](./VIBE-CODING-QUICKSTART.md) - Quick start

## 📞 Support

Jeśli masz problemy:
1. Sprawdź [Troubleshooting](#-troubleshooting)
2. Zobacz logi w `playwright-reports/test-output.log`
3. Otwórz trace w [trace.playwright.dev](https://trace.playwright.dev)
4. Zobacz video recording

---

**Wersja:** 1.0.0  
**Data:** 2025-09-30  
**Projekt:** FlowCraft N8N Automation Platform
