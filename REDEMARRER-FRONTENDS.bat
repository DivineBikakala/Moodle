@echo off
echo ========================================
echo    REDEMARRAGE DES SERVICES
echo ========================================
echo.
echo Ce script redemarre les services pour
echo prendre en compte les modifications
echo.
pause

echo [1/3] Arret des frontends...
taskkill /F /FI "WINDOWTITLE eq Frontend*" 2>nul
timeout /t 2 /nobreak >nul

echo [2/3] Redemarrage Frontend Etudiant...
start "Frontend Student" cmd /k "cd frontend-student && npm run dev"
timeout /t 5 /nobreak >nul

echo [3/3] Redemarrage Frontend Enseignant...
start "Frontend Teacher" cmd /k "cd frontend-teacher && npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo    SERVICES REDEMARRES
echo ========================================
echo.
echo - Frontend Etudiant : http://localhost:5174
echo - Frontend Enseignant : http://localhost:5173
echo - Backend : http://localhost:3001
echo.
echo Teste maintenant la creation d'etudiants !
echo.
pause

