# Test de création d'un étudiant
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TEST CREATION ETUDIANT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Générer un timestamp unique
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$email = "etudiant.test.$timestamp@example.com"
$username = "etudiant$timestamp"

Write-Host "[1/3] Test de création d'étudiant via API /auth/register..." -ForegroundColor Yellow
Write-Host "Email: $email" -ForegroundColor Gray
Write-Host "Username: $username" -ForegroundColor Gray

$body = @{
    email = $email
    username = $username
    password = "password123"
    firstName = "Marie"
    lastName = "Étudiant"
    role = "student"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body

    Write-Host "✅ Étudiant créé avec succès!" -ForegroundColor Green
    Write-Host "ID: $($response.user.id)" -ForegroundColor Gray
    Write-Host "Email: $($response.user.email)" -ForegroundColor Gray
    Write-Host "Username: $($response.user.username)" -ForegroundColor Gray
    Write-Host ""

    $userId = $response.user.id

    Write-Host "[2/3] Vérification dans la base de données..." -ForegroundColor Yellow
    $dbResult = docker exec -i moodle-postgres psql -U moodle_user -d moodle_db -c "SELECT id, email, username, role FROM users WHERE id = $userId;"
    Write-Host $dbResult -ForegroundColor Gray
    Write-Host ""

    Write-Host "[3/3] Liste de tous les étudiants:" -ForegroundColor Yellow
    $allStudents = docker exec -i moodle-postgres psql -U moodle_user -d moodle_db -c "SELECT id, email, username, role FROM users WHERE role = 'student';"
    Write-Host $allStudents -ForegroundColor Gray

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "   CREDENTIALS POUR SE CONNECTER" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Email: $email" -ForegroundColor White
    Write-Host "Mot de passe: password123" -ForegroundColor White
    Write-Host ""

} catch {
    Write-Host "❌ Erreur lors de la création de l'étudiant:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red

    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Détails de l'erreur:" -ForegroundColor Yellow
        Write-Host $responseBody -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Appuyez sur Entrée pour fermer..." -ForegroundColor Gray
Read-Host

