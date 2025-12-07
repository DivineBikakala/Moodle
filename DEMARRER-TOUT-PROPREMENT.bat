@echo off
cls
echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║        RESOLUTION ERR_CONNECTION_REFUSED                 ║
echo ║        Base de donnees NETTOYEE et PRETE                 ║
echo ╚══════════════════════════════════════════════════════════╝
echo.
echo.

echo ┌─────────────────────────────────────┐
echo │  Etape 1 : Nettoyage                │
echo └─────────────────────────────────────┘
echo Arret des processus Node...
taskkill /F /IM node.exe 2>nul
echo ✓ Processus arretes
echo.

echo ┌─────────────────────────────────────┐
echo │  Etape 2 : PostgreSQL               │
echo └─────────────────────────────────────┘
docker ps | findstr moodle-postgres >nul 2>&1
if errorlevel 1 (
    echo Demarrage de PostgreSQL...
    docker-compose up -d
    timeout /t 12 /nobreak >nul
    echo ✓ PostgreSQL demarre
) else (
    echo ✓ PostgreSQL deja en cours
)
echo.

echo ┌─────────────────────────────────────┐
echo │  Etape 3 : Backend                  │
echo └─────────────────────────────────────┘
echo.
echo Un nouveau terminal va s'ouvrir pour le backend.
echo IMPORTANT : Verifiez dans ce terminal que vous voyez :
echo.
echo   ✅ Connexion a PostgreSQL etablie avec succes
echo   ✅ Base de donnees synchronisee
echo   🚀 Backend demarre sur http://localhost:3001
echo.
echo Si vous voyez des ERREURS, le backend ne peut pas demarrer.
echo.
pause

start "✅ BACKEND MOODLE" cmd /k "cd /d "%~dp0backend" && echo. && echo Demarrage du backend... && echo. && npm run dev"

echo.
echo Attente du demarrage du backend (15 secondes)...
timeout /t 15 /nobreak >nul
echo.

echo ┌─────────────────────────────────────┐
echo │  Etape 4 : Verification             │
echo └─────────────────────────────────────┘
echo.

echo Test de connexion au backend...
curl http://localhost:3001/health >nul 2>&1
if errorlevel 1 (
    echo.
    echo ❌ Le backend ne repond PAS
    echo.
    echo DIAGNOSTIC :
    echo 1. Regardez le terminal "BACKEND MOODLE"
    echo 2. Y a-t-il des erreurs en rouge ?
    echo 3. Si oui, copiez-les et contactez le support
    echo.
    echo SOLUTIONS POSSIBLES :
    echo - Redemarrez Docker Desktop
    echo - Executez : docker-compose down -v
    echo - Puis relancez ce script
    echo.
) else (
    echo.
    echo ✅✅✅ BACKEND OPERATIONNEL ! ✅✅✅
    echo.
    echo Le backend fonctionne sur http://localhost:3001
    echo.
    echo ┌─────────────────────────────────────┐
    echo │  Etape 5 : Frontends                │
    echo └─────────────────────────────────────┘
    echo.
    echo Voulez-vous demarrer les frontends maintenant ? (O/N)
    set /p reponse=
    if /i "%reponse%"=="O" (
        echo.
        echo Demarrage des frontends...
        start "Frontend Teacher" cmd /k "cd /d "%~dp0frontend-teacher" && npm run dev"
        timeout /t 2 /nobreak >nul
        start "Frontend Student" cmd /k "cd /d "%~dp0frontend-student" && npm run dev"
        echo.
        echo ✅ Frontends demarres !
        echo.
        echo URLs :
        echo - Backend          : http://localhost:3001
        echo - Frontend Teacher : http://localhost:5173
        echo - Frontend Student : http://localhost:5174
        echo.
        echo 🎉 L'erreur ERR_CONNECTION_REFUSED est RESOLUE !
        echo.
        echo Vous pouvez maintenant :
        echo 1. Rafraichir la page du frontend etudiant
        echo 2. Creer un nouveau compte
        echo 3. Utiliser l'application
        echo.
    )
)

echo.
pause

