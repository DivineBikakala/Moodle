@echo off
echo ========================================
echo    ARRET PLATEFORME MOODLE
echo ========================================
echo.

echo [1/3] Arret du Backend et Frontend...
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo OK - Processus Node.js arretes
) else (
    echo INFO - Aucun processus Node.js en cours
)
echo.

echo [2/3] Arret de PostgreSQL...
docker-compose down
echo OK - PostgreSQL arrete
echo.

echo [3/3] Nettoyage termine
echo.
echo ========================================
echo    TOUS LES SERVICES SONT ARRETES
echo ========================================
echo.
pause

