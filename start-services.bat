@echo off
REM Lance le backend et les deux frontends dans des nouvelles fenêtres (Windows)
echo Arret des anciens processus Node...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 >nul

echo Demarrage des services...
SET ROOT=%~dp0

start "Backend" cmd /k "cd /d "%ROOT%backend" && npm run dev"
start "Frontend-Teacher" cmd /k "cd /d "%ROOT%frontend-teacher" && npm run dev"
start "Frontend-Student" cmd /k "cd /d "%ROOT%frontend-student" && npm run dev"

echo.
echo Services en cours de demarrage...
echo - Backend: http://localhost:3001
echo - Frontend Teacher: http://localhost:5173 (ou port disponible)
echo - Frontend Student: http://localhost:5174 (ou port disponible)
echo.
echo Trois fenetres de terminal vont s'ouvrir.
timeout /t 3
