@echo off
REM VISUALISER-BDD.bat - Lance Adminer (via Docker) ou affiche les instructions pour utiliser pgAdmin / DBeaver
REM Usage: double-cliquer. Le script lit le .env du backend pour récupérer les infos de connexion.

nSET BACKEND_DIR=%~dp0backend
IF NOT EXIST "%BACKEND_DIR%\.env" (
  echo .env introuvable dans %BACKEND_DIR%\ . Ouvrez manuellement le fichier pour lire les identifiants.
  pause
  exit /b 1
)

REM Lire les variables essentielles depuis .env (simple extraction)
for /f "tokens=1* delims==" %%A in ('findstr /R "^DB_HOST= ^DB_PORT= ^DB_NAME= ^DB_USER= ^DB_PASSWORD=" "%BACKEND_DIR%\.env"') do (
  set "%%A=%%B"
)

necho Informations BDD extraites du fichier %BACKEND_DIR%\.env:
echo Host: %DB_HOST%
echo Port: %DB_PORT%
echo Name: %DB_NAME%
echo User: %DB_USER%
echo Password: %DB_PASSWORD%
echo.

necho Choisissez une option:
echo 1) Lancer Adminer (via Docker) et ouvrir http://localhost:8080
echo 2) Instructions pour se connecter avec pgAdmin / DBeaver
echo 3) Quitter
set /p choice=Entrez 1,2 ou 3:

nif "%choice%"=="1" goto DOCKER_ADMINER
nif "%choice%"=="2" goto INSTRUCTIONS
nif "%choice%"=="3" goto END
echo Option invalide.
goto END

:DOCKER_ADMINER
echo Vérification de la présence de Docker...
ndocker --version >nul 2>&1
nif errorlevel 1 (
  echo Docker n'est pas installé ou non trouvé dans le PATH. Installez Docker Desktop et réessayez.
  pause
  goto END
)

necho Lancement d'Adminer dans un conteneur Docker (si déjà lancé, le port 8080 peut être utilisé)
ndocker run --rm -d -p 8080:8080 --name moodle_adminer adminer >nul 2>&1
nif errorlevel 1 (
  echo Erreur lors du lancement du conteneur Docker adminer.
  echo Si le port 8080 est utilisé, arrêtez le conteneur ou changez le port.
  pause
  goto END
)
echo Adminer démarré. Ouvrez http://localhost:8080 dans votre navigateur.
necho Utilisez ces identifiants dans Adminer:
necho SGBD: PostgreSQL
necho Serveur: %DB_HOST%:%DB_PORT%
necho Base: %DB_NAME%
necho Utilisateur: %DB_USER%
necho Mot de passe: %DB_PASSWORD%
start "" "http://localhost:8080"
ngoto END

:INSTRUCTIONS
echo Pour vous connecter avec pgAdmin / DBeaver:
necho - Ouvrez l'application (pgAdmin ou DBeaver)
necho - Créez une nouvelle connexion PostgreSQL avec les valeurs ci-dessus (Host, Port, Database, User, Password)
necho - Assurez-vous que le serveur PostgreSQL est accessible depuis votre machine (localhost ou adresse réseau)
necho.
necho Si vous utilisez une base distante, remplacez DB_HOST par l'adresse distante et vérifiez le firewall.
pause
goto END

:END
echo Fin.
pause
exit /b 0

