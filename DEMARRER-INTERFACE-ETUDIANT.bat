@echo off
cls
echo.
echo ========================================
echo    DIAGNOSTIC INTERFACE ETUDIANT
echo ========================================
echo.

REM Verification Docker
echo [1/5] Verification Docker...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Docker n'est pas lance
    echo     Demarrez Docker Desktop puis relancez ce script
    pause
    exit /b 1
)
echo [OK] Docker actif
echo.

REM Verification PostgreSQL
echo [2/5] Verification PostgreSQL...
docker ps | findstr moodle-postgres >nul
if %errorlevel% neq 0 (
    echo [!] PostgreSQL non demarre, demarrage...
    cd /d C:\Users\divin\OneDrive\Bureau\portail\Moodle
    docker-compose up -d
    timeout /t 5 /nobreak >nul
)
echo [OK] PostgreSQL actif
echo.

REM Verification Backend
echo [3/5] Verification Backend...
curl -s http://localhost:3001/health >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Backend non accessible
    echo     Assurez-vous que le backend est demarre sur http://localhost:3001
    echo     Ouvrez un terminal et executez:
    echo     cd C:\Users\divin\OneDrive\Bureau\portail\Moodle\backend
    echo     npm run dev
    echo.
    choice /C YN /M "Voulez-vous continuer quand meme"
    if errorlevel 2 exit /b 1
) else (
    echo [OK] Backend actif sur http://localhost:3001
)
echo.

REM Verification port 5174
echo [4/5] Verification port 5174...
netstat -ano | findstr :5174 >nul
if %errorlevel% equ 0 (
    echo [!] Le port 5174 est deja utilise
    echo     Le frontend etudiant tourne peut-etre deja
    echo.
    choice /C YN /M "Voulez-vous quand meme demarrer un nouveau serveur"
    if errorlevel 2 (
        echo.
        echo Ouverture du navigateur sur http://localhost:5174...
        start http://localhost:5174
        pause
        exit /b 0
    )
)
echo.

REM Demarrage Frontend Etudiant
echo [5/5] Demarrage Frontend Etudiant...
cd /d C:\Users\divin\OneDrive\Bureau\portail\Moodle\frontend-student

if not exist "node_modules\" (
    echo [!] Installation des dependances...
    call npm install
    echo.
)

echo.
echo ========================================
echo    LANCEMENT DU SERVEUR
echo ========================================
echo.
echo Le serveur va demarrer...
echo URL: http://localhost:5174
echo.
echo IMPORTANT: Ne fermez PAS cette fenetre !
echo            Le serveur tourne dans ce terminal.
echo.
echo Le navigateur s'ouvrira automatiquement dans 10 secondes...
echo.

start /min cmd /c "timeout /t 10 /nobreak >nul && start http://localhost:5174"

call npm run dev

pause

