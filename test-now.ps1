# Test immediat d'inscription
$body = @{
    email = "test.nouveau@teacher.com"
    username = "testnouveau"
    password = "Test123!"
    firstName = "Test"
    lastName = "Nouveau"
    role = "teacher"
} | ConvertTo-Json

Write-Host "TEST D'INSCRIPTION..." -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop

    Write-Host "========================================" -ForegroundColor Green
    Write-Host "     SUCCES !" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "User ID:" $response.user.id
    Write-Host "Email:" $response.user.email
    Write-Host "Username:" $response.user.username
    Write-Host "Role:" $response.user.role
    Write-Host ""
    Write-Host "Token genere:" $response.token.Substring(0, 50) "..."

} catch {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "     ERREUR !" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Status:" $_.Exception.Response.StatusCode.value__ -ForegroundColor Yellow
    Write-Host ""

    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $errorBody = $reader.ReadToEnd()
    Write-Host "Details de l'erreur:" -ForegroundColor Yellow
    Write-Host $errorBody -ForegroundColor Red
}

Write-Host ""
Read-Host "Appuyez sur Entree pour fermer"

