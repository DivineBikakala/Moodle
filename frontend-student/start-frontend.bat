@echo off
echo ========================================
echo    DEMARRAGE FRONTEND ETUDIANT
echo ========================================
echo.

cd /d C:\Users\divin\OneDrive\Bureau\portail\Moodle\frontend-student

echo Verification des dependances...
if not exist "node_modules\" (
    echo Installation des dependances...
    call npm install
)

echo.
echo Demarrage du serveur Vite...
echo URL: http://localhost:5174
echo.

call npm run dev

pause

