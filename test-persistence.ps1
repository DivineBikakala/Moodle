# Test de persistence des données
# Ce script crée un professeur et vérifie qu'il persiste dans la base de données

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TEST DE PERSISTENCE DES DONNEES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Générer un timestamp unique pour l'email
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$email = "prof.test.$timestamp@example.com"
$username = "jeanprof$timestamp"

Write-Host "[1/4] Création d'un professeur..." -ForegroundColor Yellow
Write-Host "Email: $email" -ForegroundColor Gray

$body = @{
    email = $email
    password = "password123"
    firstName = "Jean"
    lastName = "Prof"
    role = "teacher"
    username = $username
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body

    Write-Host "✅ Professeur créé avec succès!" -ForegroundColor Green
    Write-Host "ID: $($response.user.id)" -ForegroundColor Gray
    Write-Host "Email: $($response.user.email)" -ForegroundColor Gray
    Write-Host ""

    $userId = $response.user.id

    Write-Host "[2/4] Vérification dans la base de données..." -ForegroundColor Yellow
    $sqlQuery = "SELECT id, email, username, role, createdat FROM users WHERE id = $userId;"

    $dbResult = docker exec -i moodle-postgres psql -U moodle_user -d moodle_db -t -c $sqlQuery

    if ($dbResult -match $email) {
        Write-Host "✅ Utilisateur trouvé dans la base de données!" -ForegroundColor Green
        Write-Host $dbResult -ForegroundColor Gray
    } else {
        Write-Host "❌ Utilisateur NON trouvé dans la base de données!" -ForegroundColor Red
    }
    Write-Host ""

    Write-Host "[3/4] Instructions pour tester la persistence:" -ForegroundColor Yellow
    Write-Host "1. Arrêtez le backend (Ctrl+C dans le terminal du backend)" -ForegroundColor White
    Write-Host "2. Redémarrez le backend: cd backend && npm run dev" -ForegroundColor White
    Write-Host "3. Exécutez cette commande pour vérifier:" -ForegroundColor White
    Write-Host ""
    Write-Host "docker exec -i moodle-postgres psql -U moodle_user -d moodle_db -c `"SELECT id, email, username, role FROM users WHERE id = $userId;`"" -ForegroundColor Cyan
    Write-Host ""

    Write-Host "[4/4] Vérification rapide (optionnelle):" -ForegroundColor Yellow
    Write-Host "Liste de TOUS les utilisateurs:" -ForegroundColor White
    $allUsers = docker exec -i moodle-postgres psql -U moodle_user -d moodle_db -c "SELECT id, email, username, role FROM users ORDER BY id DESC LIMIT 10;"
    Write-Host $allUsers -ForegroundColor Gray

} catch {
    Write-Host "❌ Erreur lors de la création du professeur:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red

    # Vérifier si le backend est démarré
    Write-Host ""
    Write-Host "Vérification de l'état du backend..." -ForegroundColor Yellow
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method GET
        Write-Host "✅ Backend est actif: $($health.message)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Backend n'est PAS accessible sur http://localhost:3001" -ForegroundColor Red
        Write-Host "Assurez-vous que le backend est démarré avec: cd backend && npm run dev" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   FIN DU TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

