@echo off
echo ========================================
echo NETTOYAGE COMPLET DE LA BASE DE DONNEES
echo ========================================
echo.
echo Cette operation va :
echo - Arreter tous les services
echo - Supprimer TOUTE la base de donnees
echo - Redemarrer avec une base vierge
echo.
pause
echo.

echo [1/5] Arret de tous les processus Node...
taskkill /F /IM node.exe 2>nul
if %errorlevel% == 0 (
    echo ✅ Processus Node arretes
) else (
    echo ℹ️  Aucun processus Node en cours
)
echo.

echo [2/5] Arret de Docker Compose...
docker-compose down 2>nul
echo ✅ Services Docker arretes
echo.

echo [3/5] SUPPRESSION des volumes (base de donnees)...
docker-compose down -v
echo ✅ Volumes supprimes
echo.

echo [4/5] Redemarrage de PostgreSQL...
docker-compose up -d
echo Attente de l'initialisation de PostgreSQL...
timeout /t 12 /nobreak >nul
echo ✅ PostgreSQL demarre
echo.

echo [5/5] Demarrage du Backend...
echo.
echo Un nouveau terminal va s'ouvrir pour le backend.
echo Verifiez qu'il affiche :
echo   ✅ Connexion a PostgreSQL etablie avec succes
echo   ✅ Base de donnees synchronisee
echo   🚀 Backend demarre sur http://localhost:3001
echo.
pause

start "Backend Moodle" cmd /k "cd /d "%~dp0backend" && npm run dev"

echo.
echo Attente du demarrage du Backend (10 secondes)...
timeout /t 10 /nobreak >nul
echo.

echo ========================================
echo VERIFICATION
echo ========================================
echo.

netstat -ano | findstr :3001 >nul
if %errorlevel% == 0 (
    echo ✅ Backend ecoute sur le port 3001
    echo.
    echo Vous pouvez maintenant :
    echo 1. Demarrer les frontends avec START-ALL.bat
    echo 2. Ou les demarrer manuellement :
    echo    - Frontend Teacher : cd frontend-teacher ^&^& npm run dev
    echo    - Frontend Student : cd frontend-student ^&^& npm run dev
) else (
    echo ❌ Le backend ne repond pas sur le port 3001
    echo.
    echo Verifiez le terminal "Backend Moodle" pour voir les erreurs.
    echo.
    echo Si vous voyez encore l'erreur "column username",
    echo c'est que Docker n'a pas supprime les volumes.
    echo Essayez manuellement :
    echo   docker volume ls
    echo   docker volume rm moodle_postgres_data
)

echo.
echo ========================================
pause

