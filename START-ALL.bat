@echo off
echo ========================================
echo    DEMARRAGE PLATEFORME MOODLE
echo ========================================
echo.

REM Vérifier si Docker est lancé
echo [1/4] Verification de Docker...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERREUR: Docker n'est pas lance. Veuillez demarrer Docker Desktop.
    pause
    exit /b 1
)
echo OK - Docker est actif
echo.

REM Démarrer PostgreSQL avec Docker Compose
echo [2/4] Demarrage de PostgreSQL...
docker-compose up -d
timeout /t 5 /nobreak >nul
echo OK - PostgreSQL demarre
echo.

REM Démarrer le Backend
echo [3/4] Demarrage du Backend...
start "Backend Moodle" cmd /k "cd backend && npm run dev"
timeout /t 10 /nobreak >nul
echo OK - Backend demarre sur http://localhost:3001
echo.

REM Démarrer le Frontend Enseignant
echo [4/4] Demarrage du Frontend Enseignant...
start "Frontend Teacher" cmd /k "cd frontend-teacher && npm run dev"
timeout /t 8 /nobreak >nul
echo OK - Frontend demarre sur http://localhost:5173
echo.

echo ========================================
echo    TOUS LES SERVICES SONT DEMARRES
echo ========================================
echo.
echo - PostgreSQL : localhost:5432
echo - Backend API : http://localhost:3001
echo - Frontend Enseignant : http://localhost:5173
echo.
echo Ouverture du navigateur...
start http://localhost:5173
echo.
echo Appuyez sur une touche pour fermer cette fenetre...
pause >nul

