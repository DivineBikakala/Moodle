# Test inscription apres recreation des tables
$body = @{
    email = "premiere.inscription@teacher.com"
    username = "premierprof"
    password = "Test123!"
    firstName = "Premier"
    lastName = "Prof"
    role = "teacher"
} | ConvertTo-Json

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST INSCRIPTION APRES RECREATION BDD" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop

    Write-Host "========================================" -ForegroundColor Green
    Write-Host "     CA FONCTIONNE !!!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "ID:" $response.user.id -ForegroundColor White
    Write-Host "Email:" $response.user.email -ForegroundColor White
    Write-Host "Username:" $response.user.username -ForegroundColor White
    Write-Host "Nom:" $response.user.firstName $response.user.lastName -ForegroundColor White
    Write-Host "Role:" $response.user.role -ForegroundColor White
    Write-Host ""
    Write-Host "Token JWT:" -ForegroundColor Yellow
    Write-Host $response.token.Substring(0, 60) "..." -ForegroundColor Gray
    Write-Host ""
    Write-Host "Vous pouvez maintenant vous connecter sur http://localhost:5173" -ForegroundColor Cyan

} catch {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "     ERREUR" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""

    if ($_.Exception.Response) {
        Write-Host "Status HTTP:" $_.Exception.Response.StatusCode.value__ -ForegroundColor Yellow

        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host ""
        Write-Host "Reponse du serveur:" -ForegroundColor Yellow
        Write-Host $errorBody -ForegroundColor Red
    } else {
        Write-Host "Erreur:" $_.Exception.Message -ForegroundColor Red
    }
}

Write-Host ""
Read-Host "Appuyez sur Entree pour continuer"

