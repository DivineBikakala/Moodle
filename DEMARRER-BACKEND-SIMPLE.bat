@echo off
title Backend Moodle
color 0A
echo.
echo ╔══════════════════════════════════════════╗
echo ║     DEMARRAGE DU BACKEND MOODLE          ║
echo ╚══════════════════════════════════════════╝
echo.
echo Demarrage en cours...
echo.

cd /d "%~dp0backend"
npm run dev

echo.
echo ╔══════════════════════════════════════════╗
echo ║     BACKEND ARRETE                       ║
echo ╚══════════════════════════════════════════╝
echo.
pause

