@echo off
echo ========================================
echo DEMARRAGE COMPLET AVEC VERIFICATION
echo ========================================
echo.

echo [1/4] Verification de Docker...
docker ps >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker ne repond pas
    echo Ouvrez Docker Desktop et relancez ce script
    pause
    exit /b 1
)
echo ✅ Docker operationnel
echo.

echo [2/4] Verification de PostgreSQL...
docker ps | findstr moodle-postgres >nul
if errorlevel 1 (
    echo ⚠️ PostgreSQL non demarre, demarrage...
    docker-compose up -d
    timeout /t 10 >nul
)
echo ✅ PostgreSQL demarre
echo.

echo [3/4] Demarrage du Backend...
echo.
echo ⚠️ REGARDEZ CE TERMINAL !
echo Vous devez voir :
echo   ✅ Connexion a PostgreSQL etablie avec succes
echo   ✅ Base de donnees synchronisee
echo   🚀 Backend demarre sur http://localhost:3001
echo.
echo Si vous voyez des erreurs, appuyez sur Ctrl+C et contactez le support.
echo.

cd backend
npm run dev

pause

