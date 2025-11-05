# Script de test pour l'authentification

Write-Host "=== Test 1: Inscription d'un enseignant ===" -ForegroundColor Cyan

$body = @{
    email = "prof@test.com"
    password = "password123"
    firstName = "Jean"
    lastName = "Dupont"
    role = "teacher"
} | ConvertTo-Json

$response1 = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" -Method Post -Body $body -ContentType "application/json"
Write-Host "Réponse:" -ForegroundColor Green
$response1 | ConvertTo-Json -Depth 10
$token1 = $response1.token

Write-Host "`n=== Test 2: Inscription d'un étudiant ===" -ForegroundColor Cyan

$body2 = @{
    email = "etudiant@test.com"
    password = "password456"
    firstName = "Marie"
    lastName = "Martin"
    role = "student"
} | ConvertTo-Json

$response2 = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" -Method Post -Body $body2 -ContentType "application/json"
Write-Host "Réponse:" -ForegroundColor Green
$response2 | ConvertTo-Json -Depth 10
$token2 = $response2.token

Write-Host "`n=== Test 3: Connexion de l'enseignant ===" -ForegroundColor Cyan

$loginBody = @{
    email = "prof@test.com"
    password = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
Write-Host "Réponse:" -ForegroundColor Green
$loginResponse | ConvertTo-Json -Depth 10

Write-Host "`n=== Test 4: Récupération du profil (enseignant) ===" -ForegroundColor Cyan

$headers = @{
    Authorization = "Bearer $token1"
}

$profileResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/me" -Method Get -Headers $headers
Write-Host "Réponse:" -ForegroundColor Green
$profileResponse | ConvertTo-Json -Depth 10

Write-Host "`n=== Test 5: Récupération du profil (étudiant) ===" -ForegroundColor Cyan

$headers2 = @{
    Authorization = "Bearer $token2"
}

$profileResponse2 = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/me" -Method Get -Headers $headers2
Write-Host "Réponse:" -ForegroundColor Green
$profileResponse2 | ConvertTo-Json -Depth 10

Write-Host "`n=== Test 6: Tentative de connexion avec mauvais mot de passe ===" -ForegroundColor Cyan

try {
    $badLoginBody = @{
        email = "prof@test.com"
        password = "wrongpassword"
    } | ConvertTo-Json

    $badLoginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method Post -Body $badLoginBody -ContentType "application/json"
} catch {
    Write-Host "Erreur attendue:" -ForegroundColor Yellow
    $_.Exception.Message
}

Write-Host "`n=== Tous les tests terminés ===" -ForegroundColor Green

