@echo off
echo =====================================
echo   FlowCraft - Rebuild and Start
echo =====================================
echo.

REM Kill any existing processes on specific ports (more selective)
echo 🛑 Zatrzymywanie istniejacych procesow...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    echo Zatrzymywanie procesu na porcie 3000: %%a
    taskkill /f /pid %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8002') do (
    echo Zatrzymywanie procesu na porcie 8002: %%a
    taskkill /f /pid %%a >nul 2>&1
)
REM More selective process killing - only kill node processes from this directory
wmic process where "name='node.exe' and commandline like '%%flowcraft%%'" delete >nul 2>&1
wmic process where "name='nodemon.exe' and commandline like '%%flowcraft%%'" delete >nul 2>&1
timeout /t 3 /nobreak >nul

echo.
echo 🔧 Przebudowywanie aplikacji...
echo.

REM Install/update frontend dependencies
echo 📦 Instalowanie zaleznosci frontend...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Blad przy instalacji zaleznosci frontend
    pause
    exit /b 1
)

REM Install/update backend dependencies
echo 📦 Instalowanie zaleznosci backend...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Blad przy instalacji zaleznosci backend
    cd ..
    pause
    exit /b 1
)
cd ..

REM Skip build for development - we'll run dev server instead
echo ℹ️ Pomijanie budowania - uruchamiamy w trybie dev...

REM Run linting (optional - continue on warnings)
echo 🧹 Sprawdzanie jakosci kodu...
call npm run lint
if %errorlevel% neq 0 (
    echo ⚠️ Znaleziono problemy z jakoscia kodu - kontynuujemy...
)

echo.
echo ✅ Przebudowa zakonczona pomyslnie!
echo.
echo 🚀 Uruchamianie serwerow...
echo.

REM Start backend API server in background
echo 📡 Uruchamianie Backend API na porcie 8002...
cd backend
start /b npm run dev:api
cd ..

REM Wait for backend to start
echo ⏳ Oczekiwanie na uruchomienie backend...
timeout /t 8 /nobreak >nul

REM Start frontend dev server in background
echo 🌐 Uruchamianie Frontend na porcie 3000...
start /b npm run dev

REM Wait for frontend to start
echo ⏳ Oczekiwanie na uruchomienie frontend...
timeout /t 5 /nobreak >nul

echo.
echo ✅ Serwery zostaly uruchomione:
echo 📡 Backend API: http://localhost:8002
echo 🌐 Frontend:    http://localhost:3000
echo.
echo ℹ️  Sprawdz konsole przegladarki pod katem bledow JavaScript
echo ℹ️  Przetestuj funkcjonalnosc aplikacji
echo.
echo 🔍 Testowanie polaczenia...
timeout /t 5 /nobreak >nul

REM Test backend with curl (safer than PowerShell)
echo 🔍 Testowanie Backend API...
curl -s -o nul -w "%%{http_code}" http://localhost:8002/api/health > temp_status.txt 2>nul
set /p backend_status=<temp_status.txt
del temp_status.txt 2>nul
if "%backend_status%"=="200" (
    echo ✅ Backend API odpowiada poprawnie
) else (
    echo ❌ Backend API nie odpowiada (status: %backend_status%)
    echo    Sprawdz logi lub uruchom recznie: cd backend ^&^& npm run dev:api
)

REM Test frontend with simpler approach
echo 🔍 Testowanie Frontend...
netstat -an | findstr ":3000" >nul
if %errorlevel% equ 0 (
    echo ✅ Frontend uruchomiony na porcie 3000
) else (
    echo ❌ Frontend nie odpowiada na porcie 3000
    echo    Sprawdz logi lub uruchom recznie: npm run dev
)

echo.
echo 📋 Checklist po uruchomieniu:
echo    □ Sprawdz logi backend w konsoli
echo    □ Sprawdz logi frontend w konsoli
echo    □ Sprawdz konsole przegladarki (F12) pod katem bledow JavaScript
echo    □ Przetestuj logowanie i podstawowe funkcje
echo.
echo ✅ Skrypt zakonczony pomyslnie!
echo 📡 Backend API: http://localhost:8002
echo 🌐 Frontend:    http://localhost:3000
echo.
echo ℹ️  Serwery dzialaja w tle. Aby je zatrzymac, uruchom ponownie skrypt.