@echo off
echo ========================================
echo REDEMARRAGE PROPRE - NETTOYAGE COMPLET
echo ========================================
echo.

echo [1/6] Arret de TOUS les processus Node...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul
echo OK
echo.

echo [2/6] Arret de Docker...
cd /d "%~dp0"
docker-compose down
timeout /t 2 >nul
echo OK
echo.

echo [3/6] Suppression des volumes Docker (base de donnees)...
docker-compose down -v
timeout /t 2 >nul
echo OK
echo.

echo [4/6] Demarrage PostgreSQL (Docker)...
docker-compose up -d
echo Attente du demarrage de PostgreSQL...
timeout /t 10 >nul
echo OK
echo.

echo [5/6] Demarrage Backend...
start "Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"
echo Attente du demarrage du Backend...
timeout /t 5 >nul
echo OK
echo.

echo [6/6] Demarrage Frontends...
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
echo IMPORTANT:
echo 1. La base de donnees a ete REINITIALIZEE
echo 2. Tous les utilisateurs ont ete supprimes
echo 3. Vous devez recreer les comptes
echo.
echo Verification dans 10 secondes...
timeout /t 10 >nul
echo.

echo Verification du Backend...
curl http://localhost:3001/api/auth/health 2>nul
if errorlevel 1 (
    echo.
    echo ❌ ERREUR: Le backend ne repond pas
    echo Regardez le terminal "Backend" pour voir les erreurs
) else (
    echo.
    echo ✅ Backend demarre avec succes!
)
echo.

pause

