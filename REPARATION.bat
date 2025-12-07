@echo off
echo ========================================
echo DIAGNOSTIC ET REPARATION
echo ========================================
echo.

echo Etape 1: Verification de Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker n'est pas installe ou Docker Desktop n'est pas demarre
    echo.
    echo SOLUTION:
    echo 1. Ouvrez Docker Desktop
    echo 2. Attendez qu'il soit pret
    echo 3. Relancez ce script
    echo.
    pause
    exit /b 1
)
echo ✅ Docker est disponible
echo.

echo Etape 2: Arret de tous les services...
taskkill /F /IM node.exe >nul 2>&1
cd /d "%~dp0"
docker-compose down -v >nul 2>&1
echo ✅ Services arretes
echo.

echo Etape 3: Demarrage de PostgreSQL...
docker-compose up -d
if errorlevel 1 (
    echo ❌ Impossible de demarrer PostgreSQL
    echo Verifiez que Docker Desktop est bien lance
    pause
    exit /b 1
)
echo ✅ PostgreSQL demarre
echo.

echo Attente de l'initialisation de PostgreSQL (15 secondes)...
timeout /t 15 >nul
echo.

echo Etape 4: Demarrage du Backend...
start "Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"
echo Attente du demarrage du Backend (8 secondes)...
timeout /t 8 >nul
echo.

echo Etape 5: Verification du Backend...
curl http://localhost:3001/api/auth/health >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Le backend ne repond pas encore
    echo Regardez le terminal "Backend" pour voir l'etat
) else (
    echo ✅ Backend operationnel!
)
echo.

echo Etape 6: Demarrage des Frontends...
start "Frontend-Teacher" cmd /k "cd /d "%~dp0frontend-teacher" && npm run dev"
timeout /t 2 >nul
start "Frontend-Student" cmd /k "cd /d "%~dp0frontend-student" && npm run dev"
echo ✅ Frontends demarres
echo.

echo ========================================
echo DEMARRAGE TERMINE
echo ========================================
echo.
echo URLs:
echo - Backend:          http://localhost:3001
echo - Frontend Teacher: http://localhost:5173
echo - Frontend Student: http://localhost:5174
echo.
echo IMPORTANT: Base de donnees reinitializee!
echo Vous devez recreer les comptes utilisateurs.
echo.
pause

