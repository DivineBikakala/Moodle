@echo off
echo Test de creation d'etudiant via l'API
echo.

curl -X POST http://localhost:3001/api/students ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer VOTRE_TOKEN_ICI" ^
  -d "{\"username\":\"etudiant_test\",\"email\":\"etudiant@test.com\",\"password\":\"Test123!\",\"firstName\":\"Etudiant\",\"lastName\":\"Test\",\"level\":1}"

echo.
echo.
pause

