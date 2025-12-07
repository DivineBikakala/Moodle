l# Test d'inscription avec un nouvel enseignant
Write-Host "=== Test d'inscription - Nouvel enseignant ===" -ForegroundColor Cyan
Write-Host ""

$body = @{
    email = "prof.bernard@teacher.com"
    username = "profbernard"
    password = "Secure123!"
    firstName = "Marie"
    lastName = "Bernard"
    role = "teacher"
} | ConvertTo-Json

Write-Host "Tentative d'inscription pour: Marie Bernard" -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" -Method Post -Body $body -ContentType "application/json"

    Write-Host "========================================" -ForegroundColor Green
    Write-Host "    INSCRIPTION REUSSIE !" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Nom complet:" $response.user.firstName $response.user.lastName -ForegroundColor Cyan
    Write-Host "Email:" $response.user.email -ForegroundColor Cyan
    Write-Host "Username:" $response.user.username -ForegroundColor Cyan
    Write-Host "Role:" $response.user.role -ForegroundColor Cyan
    Write-Host "ID:" $response.user.id -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Token JWT genere (pour se connecter):" -ForegroundColor Yellow
    Write-Host $response.token.Substring(0, 50) "..." -ForegroundColor Gray
    Write-Host ""
    Write-Host "Vous pouvez maintenant vous connecter avec:" -ForegroundColor Green
    Write-Host "  Email: prof.bernard@teacher.com" -ForegroundColor White
    Write-Host "  Password: Secure123!" -ForegroundColor White

} catch {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "    ERREUR D'INSCRIPTION" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Message:" $_.Exception.Message -ForegroundColor Red

    if ($_.ErrorDetails) {
        Write-Host ""
        Write-Host "Details:" -ForegroundColor Yellow
        Write-Host $_.ErrorDetails.Message
    }
}

Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

