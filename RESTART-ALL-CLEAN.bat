@echo off
echo ========================================
echo    NETTOYAGE ET REDEMARRAGE COMPLET
echo ========================================
echo.

echo [1/4] Arret de tous les processus Node...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul

echo [2/4] Nettoyage du cache Vite (frontend-student)...
cd /d "%~dp0frontend-student"
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo Cache Vite supprime
) else (
    echo Pas de cache a supprimer
)

echo [3/4] Nettoyage du cache Vite (frontend-teacher)...
cd /d "%~dp0frontend-teacher"
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo Cache Vite supprime
) else (
    echo Pas de cache a supprimer
)

echo [4/4] Redemarrage de tous les services...
echo.

cd /d "%~dp0"
start "Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"
timeout /t 2 >nul

start "Frontend-Teacher" cmd /k "cd /d "%~dp0frontend-teacher" && npm run dev"
timeout /t 2 >nul

start "Frontend-Student" cmd /k "cd /d "%~dp0frontend-student" && npm run dev"

echo.
echo ========================================
echo    SERVICES DEMARRES
echo ========================================
echo.
echo Backend:           http://localhost:3001
echo Frontend Teacher:  http://localhost:5173
echo Frontend Student:  http://localhost:5174
echo.
echo Attends 10-15 secondes que les serveurs demarrent...
echo Ensuite, ouvre http://localhost:5174 dans le navigateur
echo.
pause

