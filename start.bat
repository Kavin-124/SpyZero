@echo off
title SpyZero Privacy Scanner
echo ========================================================
echo        🛡️ Starting SpyZero Counter-Surveillance Suite
echo ========================================================
echo.
echo [1/2] Starting Native Hardware Scanner Backend (Port 8000)...
start "SpyZero Scanner Backend" cmd /k "python backend/real_scanner.py"

echo [2/2] Starting Frontend Vite Web Server (Port 5173)...
start "SpyZero Frontend" cmd /k "npm run dev"

echo.
echo Opening SpyZero Dashboard in your browser...
timeout /t 3 >nul
start http://localhost:5173

echo.
echo All services launched! Keep the terminal windows open while scanning.
pause
