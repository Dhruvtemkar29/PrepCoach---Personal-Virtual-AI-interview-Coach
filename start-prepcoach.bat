@echo off
title PrepCoach - Full Stack AI Interview Platform
color 0A

echo ========================================================
echo        Starting PrepCoach Application Services
echo ========================================================
echo.

:: 1. Start Python AI Microservice (Port 8000)
echo [1/3] Launching Python FastAPI AI Service on port 8000...
start "PrepCoach - Python AI Service" cmd /k "cd /d %~dp0ai-service && .\venv\Scripts\uvicorn.exe main:app --port 8000 --reload"

:: 2. Start Node.js Express Backend (Port 5000)
echo [2/3] Launching Node.js Backend on port 5000...
start "PrepCoach - Node.js Backend" cmd /k "cd /d %~dp0backend && node server.js"

:: 3. Start Vite React Frontend (Port 5173)
echo [3/3] Launching React Vite Frontend on port 5173...
start "PrepCoach - React Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo ========================================================
echo All 3 services are launching in separate windows!
echo - React Frontend:   http://localhost:5173
echo - Node.js Backend:  http://localhost:5000
echo - Python AI Service: http://localhost:8000
echo ========================================================
echo.
pause
