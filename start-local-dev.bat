@echo off
echo =====================================
echo   N8N Automation - Local Development
echo =====================================
echo.
echo Starting servers in separate terminals...
echo.

REM Start backend API server
start "Backend API Server" cmd /k "cd backend && npm run dev:api"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend dev server  
start "Frontend Dev Server" cmd /k "npm run dev"

echo.
echo ✅ Starting development servers:
echo 📡 Backend API: http://localhost:8002
echo 🌐 Frontend:    http://localhost:3000 (or 5173)
echo.
echo Press any key to close this window...
pause >nul