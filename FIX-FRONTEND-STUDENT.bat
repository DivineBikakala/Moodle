@echo off
echo ========================================
echo SOLUTION ERREUR "FAILED TO FETCH"
echo ========================================
echo.

echo [Etape 1/5] Arret de tous les processus Node...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul
echo OK - Processus arretes
echo.

echo [Etape 2/5] Nettoyage cache Vite frontend-student...
cd /d "%~dp0frontend-student"
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo OK - Cache supprime
) else (
    echo OK - Pas de cache a supprimer
)
echo.

echo [Etape 3/5] Verification du fichier main.ts...
echo Ligne 388 devrait etre juste une accolade fermante }
type main.ts | findstr /N "." | findstr "388:"
echo.

echo [Etape 4/5] Compilation de test...
call npm run build
if errorlevel 1 (
    echo ERREUR - La compilation a echoue
    echo Le probleme est dans le code TypeScript
    pause
    exit /b 1
)
echo OK - Compilation reussie
echo.

echo [Etape 5/5] Demarrage du frontend-student...
start "Frontend-Student" cmd /k "npm run dev"
timeout /t 3 >nul

echo.
echo ========================================
echo TERMINE
echo ========================================
echo.
echo Le frontend-student devrait demarrer dans une nouvelle fenetre.
echo Attends 10 secondes puis va sur http://localhost:5174
echo.
echo Si tu vois encore "Transform failed", le fichier main.ts
echo n'est pas a jour. Dis-le moi et je vais le corriger.
echo.
pause

