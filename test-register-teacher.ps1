# Test d'inscription enseignant
Write-Host "=== Test d'inscription enseignant ===" -ForegroundColor Cyan
Write-Host ""

$body = @{
    email = "alice.dupont@teacher.com"
    username = "alicedupont"
    password = "Test123!"
    firstName = "Alice"
    lastName = "Dupont"
    role = "teacher"
} | ConvertTo-Json

Write-Host "Donnees envoyees:" -ForegroundColor Yellow
Write-Host $body
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" -Method Post -Body $body -ContentType "application/json"

    Write-Host "=== SUCCES D'INSCRIPTION ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Token JWT:" -ForegroundColor Cyan
    Write-Host $response.token
    Write-Host ""
    Write-Host "Informations utilisateur:" -ForegroundColor Cyan
    Write-Host ($response.user | ConvertTo-Json -Depth 5)

} catch {
    Write-Host "=== ERREUR D'INSCRIPTION ===" -ForegroundColor Red
    Write-Host ""
    Write-Host "Message:" $_.Exception.Message -ForegroundColor Red

    if ($_.ErrorDetails) {
        Write-Host ""
        Write-Host "Details de l'erreur:" -ForegroundColor Yellow
        Write-Host $_.ErrorDetails.Message
    }
}

