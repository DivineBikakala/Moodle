@echo off
echo ========================================
echo REDEMARRAGE COMPLET - TOUS LES SERVICES
echo ========================================
echo.

echo [1/4] Arret de TOUS les processus Node...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul
echo OK
echo.

echo [2/4] Demarrage PostgreSQL (Docker)...
cd /d "%~dp0"
docker-compose up -d
timeout /t 3 >nul
echo OK
echo.

echo [3/4] Demarrage Backend...
start "Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"
timeout /t 3 >nul
echo OK
echo.

echo [4/4] Demarrage Frontends...
start "Frontend-Teacher" cmd /k "cd /d "%~dp0frontend-teacher" && npm run dev"
timeout /t 2 >nul
start "Frontend-Student" cmd /k "cd /d "%~dp0frontend-student" && npm run dev"
echo OK
echo.

echo ========================================
echo TOUS LES SERVICES SONT DEMARRES
echo ========================================
echo.
echo Backend:           http://localhost:3001
echo Frontend Teacher:  http://localhost:5173
echo Frontend Student:  http://localhost:5174
echo.
echo Attends 15 secondes que tout demarre...
echo.
echo VERIFICATION:
echo 1. Regarde le terminal "Frontend-Student"
echo 2. Il doit afficher "ready in xxx ms"
echo 3. S'il affiche "Transform failed" - le probleme persiste
echo.
pause

