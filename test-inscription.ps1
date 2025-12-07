# Test d'inscription enseignant
$body = @{
    email = "alice@teacher.com"
    username = "aliceteacher"
    password = "Test123!"
    firstName = "Alice"
    lastName = "Dupont"
    role = "teacher"
} | ConvertTo-Json

Write-Host "Test d'inscription enseignant..." -ForegroundColor Cyan
Write-Host "Body: $body" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" -Method Post -Body $body -ContentType "application/json"
    Write-Host "✅ Inscription réussie!" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "❌ Erreur lors de l'inscription:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Détails:" -ForegroundColor Yellow
        Write-Host $_.ErrorDetails.Message -ForegroundColor Yellow
    }
}

