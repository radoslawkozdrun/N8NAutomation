# 🎭 Playwright MCP - Quick Start for Vibe Coding

## Jak używać z narzędziem Vibe Coding

### 1. Przed rozpoczęciem pracy
Upewnij się, że Claude Desktop ma dostęp do Playwright MCP:
```bash
# Sprawdź konfigurację
cat .mcp.json
```

### 2. Podczas pracy z Vibe Coding

#### Opcja A: Automatyczne testowanie (ZALECANE)
Powiedz Claude:
```
Przed zakończeniem pracy, użyj playwright-test MCP aby zweryfikować czy frontend działa poprawnie.
```

#### Opcja B: Uruchom skrypt npm
```bash
npm run test:frontend
```

#### Opcja C: Uruchom batch/shell script
```bash
# Windows
test-frontend.bat

# Linux/Mac
./test-frontend.sh
```

### 3. Co sprawdza automatyczne testowanie?

✅ **Kompilacja TypeScript** - Czy kod się buduje bez błędów  
✅ **Uruchomienie serwera** - Czy dev server startuje poprawnie  
✅ **Błędy konsoli** - Czy są błędy JavaScript w przeglądarce  
✅ **Ostrzeżenia konsoli** - Czy są warningi w konsoli  
✅ **Performance** - Czas ładowania strony  
✅ **Podstawowa funkcjonalność** - Czy strona się ładuje  

### 4. Interpretacja wyników

#### ✅ SUKCES - Wszystkie testy przeszły
```
[OK] TypeScript compilation successful
[OK] Development server is running
[OK] No console errors detected
[OK] No console warnings
```
**Akcja:** Możesz commitować kod!

#### ❌ BŁĄD - Znaleziono błędy konsoli
```
[ERROR] Found 3 console error(s)

❌ Console Errors:
1. Uncaught ReferenceError: foo is not defined
   at App.tsx:25:10
```
**Akcja:** Napraw błędy przed commitowaniem!

#### ⚠️ WARNING - Znaleziono ostrzeżenia
```
[WARNING] Found 2 console warning(s)

⚠️ Console Warnings:
1. Warning: Each child in a list should have a unique "key" prop
```
**Akcja:** Zalecane naprawienie, ale można commitować

### 5. Gdzie znajdziesz raporty?

```
playwright-reports/
├── test-report.html       ← 🎨 Ładny raport HTML (otwórz w przeglądarce)
├── test-report.md         ← 📝 Markdown summary
├── test-results.json      ← 📊 Wyniki w JSON
├── test-output.log        ← 📜 Pełne logi
├── trace.zip              ← 🔍 Trace Playwright (otwórz na trace.playwright.dev)
└── video.webm             ← 🎥 Nagranie wideo testu
```

### 6. Workflow z Vibe Coding - KROK PO KROKU

```
1. Rozpocznij pracę z Vibe Coding
   ↓
2. Vibe modyfikuje pliki
   ↓
3. Vibe mówi 'DONE'
   ↓
4. Uruchom: npm run test:frontend
   ↓
5. Sprawdź wyniki w playwright-reports/test-report.html
   ↓
6. Jeśli są błędy → Wróć do kroku 2 i napraw
   ↓
7. Jeśli wszystko OK → Commit & Push ✅
```

### 7. Przykładowe prompty dla Claude

#### Prompt 1: Podstawowy test
```
Zakończyłeś pracę nad komponentem. Użyj playwright-test MCP żeby sprawdzić czy nie ma błędów w konsoli.
```

#### Prompt 2: Z naprawą błędów
```
1. Zmodyfikuj komponent Dashboard
2. Po zakończeniu uruchom playwright-test
3. Jeśli znajdziesz błędy, napraw je automatycznie
4. Powtarzaj aż wszystkie testy przejdą
```

#### Prompt 3: Pre-commit check
```
Zanim zacommituję kod, uruchom pełne testy frontendu używając Playwright MCP i pokaż mi wszystkie znalezione problemy.
```

### 8. Konfiguracja dla różnych przypadków

#### Testowanie na mobile (viewport)
```bash
npx @playwright/mcp@latest \
  --viewport-size 375x667 \
  --device "iPhone 15" \
  navigate http://localhost:3000
```

#### Testowanie z wolnym internetem
```bash
npx @playwright/mcp@latest \
  --browser chrome \
  --headless \
  navigate http://localhost:3000
```

#### Debug mode (z widoczną przeglądarką)
```bash
npx @playwright/mcp@latest \
  --browser chrome \
  navigate http://localhost:3000
```

### 9. Troubleshooting

#### Problem: "Server timeout"
**Rozwiązanie:** 
```bash
# Sprawdź czy port 3000 jest wolny
netstat -ano | findstr :3000

# Zabij proces jeśli zajęty (Windows)
taskkill /PID <PID> /F

# Zabij proces jeśli zajęty (Linux/Mac)
kill -9 <PID>
```

#### Problem: "Playwright not found"
**Rozwiązanie:**
```bash
npm install -g @playwright/mcp@latest
```

#### Problem: "Cannot parse test results"
**Rozwiązanie:**
- Sprawdź `playwright-reports/test-output.log`
- Upewnij się że init script się wykonał
- Zwiększ timeout w skrypcie

#### Problem: "TypeScript compilation failed"
**Rozwiązanie:**
```bash
# Sprawdź błędy kompilacji
npm run build

# Napraw błędy TypeScript i spróbuj ponownie
```

### 10. Best Practices

✅ **DO:**
- Zawsze testuj przed commitowaniem
- Przeglądaj raport HTML po każdym teście
- Naprawiaj wszystkie błędy (errors), warningi są opcjonalne
- Zachowaj trace.zip jeśli znalazłeś bug
- Testuj w headless mode dla szybkości

❌ **DON'T:**
- Nie commituj kodu z błędami konsoli
- Nie ignoruj powtarzających się warningów
- Nie testuj z nieaktualnymi zależnościami
- Nie uruchamiaj wielu testów równocześnie

### 11. Integracja z Git

Dodaj do `.git/hooks/pre-commit`:
```bash
#!/bin/bash
npm run test:frontend
if [ $? -ne 0 ]; then
    echo "❌ Frontend tests failed. Commit aborted."
    exit 1
fi
```

Ustaw uprawnienia:
```bash
chmod +x .git/hooks/pre-commit
```

### 12. CI/CD Integration

Dodaj do GitHub Actions (`.github/workflows/test.yml`):
```yaml
name: Frontend Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run Frontend Tests
        run: npm run test:frontend
        
      - name: Upload Test Reports
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-reports
          path: playwright-reports/
          retention-days: 30
```

---

## 🚀 QUICK COMMANDS

```bash
# Szybki test
npm run test:frontend

# Test z widoczną przeglądarką (debug)
npx @playwright/mcp@latest --browser chrome navigate http://localhost:3000

# Tylko kompilacja TypeScript
npm run test:quick

# Pełny test z video recording (Windows)
test-frontend.bat

# Pełny test z video recording (Linux/Mac)
./test-frontend.sh
```

## 📚 Dodatkowe zasoby

- [Playwright MCP Documentation](https://github.com/microsoft/playwright-mcp)
- [Playwright Trace Viewer](https://trace.playwright.dev) - Otwórz trace.zip tutaj
- [PLAYWRIGHT-GUIDE.md](./PLAYWRIGHT-GUIDE.md) - Pełna dokumentacja

---

**Ostatnia aktualizacja:** 2025-09-30  
**Projekt:** FlowCraft N8N Automation
