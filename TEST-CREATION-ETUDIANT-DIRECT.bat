@echo off
echo ========================================
echo TEST CREATION ETUDIANT - DIRECT API
echo ========================================
echo.
echo Ce script va tester la creation d'un etudiant directement via l'API.
echo Vous devez d'abord vous connecter pour obtenir un token.
echo.
pause
echo.

echo Etape 1: Connexion en tant qu'enseignant
echo Entrez votre email enseignant:
set /p EMAIL=

echo Entrez votre mot de passe:
set /p PASSWORD=

echo.
echo Connexion en cours...
curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"%EMAIL%\",\"password\":\"%PASSWORD%\"}" > temp_login.json

echo.
echo Reponse enregistree dans temp_login.json
echo Ouvrez ce fichier et copiez le token (entre les guillemets apres "token":)
echo.
pause
echo.

echo Etape 2: Creation d'un etudiant
echo Entrez le TOKEN obtenu:
set /p TOKEN=

echo.
echo Creation de l'etudiant...
curl -X POST http://localhost:3001/api/students -H "Content-Type: application/json" -H "Authorization: Bearer %TOKEN%" -d "{\"username\":\"etudiant_test\",\"email\":\"etudiant_test@moodle.com\",\"password\":\"Test123!\",\"firstName\":\"Test\",\"lastName\":\"Etudiant\",\"phone\":\"0123456789\",\"level\":1}"

echo.
echo.
echo Si vous voyez un message d'erreur, il sera affiche ci-dessus.
echo.
pause

del temp_login.json 2>nul

