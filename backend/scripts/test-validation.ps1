$ErrorActionPreference = 'Continue'
$base = 'http://localhost:3001'

Write-Output "`n=== Test validation des endpoints d'enrollment ===`n"

# Login student
try{
    $student = Invoke-RestMethod -Method Post -Uri "$base/api/auth/login" -ContentType 'application/json' -Body (@{email='student@example.com'; password='Password123!'} | ConvertTo-Json)
    $token = $student.token
    Write-Output "✓ Student logged in successfully"
}catch{
    Write-Error "Failed to login student: $_"
    exit 1
}

# Test 1: Try to enroll with invalid course ID (non-numeric)
Write-Output "`nTest 1: Enrollment avec ID de cours invalide (non-numérique)"
try{
    $hdr = @{ Authorization = "Bearer $token" }
    $result = Invoke-RestMethod -Method Post -Uri "$base/api/courses/abc/enroll" -Headers $hdr -ContentType 'application/json' -Body '{}'
    Write-Output "✗ ÉCHEC: La validation aurait dû rejeter cet ID invalide"
    $result | ConvertTo-Json
}catch{
    $statusCode = $_.Exception.Response.StatusCode.value__
    if($statusCode -eq 400){
        Write-Output "✓ SUCCÈS: Validation a rejeté l'ID invalide (HTTP 400)"
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $responseBody = $reader.ReadToEnd()
        Write-Output "Réponse: $responseBody"
    }else{
        Write-Output "✗ Code de statut inattendu: $statusCode"
    }
}

# Test 2: Try to unenroll with invalid course ID

Write-Output "`nTest 2: Desinscription avec ID de cours invalide"
try{
    $result = Invoke-RestMethod -Method Delete -Uri "$base/api/courses/xyz/unenroll" -Headers $hdr
    Write-Output "ECHEC: La validation aurait du rejeter cet ID invalide"
    $result | ConvertTo-Json
}catch{
    $statusCode = $_.Exception.Response.StatusCode.value__
    if($statusCode -eq 400){
        Write-Output "SUCCES: Validation a rejete l'ID invalide (HTTP 400)"
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $responseBody = $reader.ReadToEnd()
        Write-Output "Reponse: $responseBody"
    }else{
        Write-Output "Code de statut inattendu: $statusCode"
    }
}

# Test 3: Valid enrollment (should work)
Write-Output "`nTest 3: Inscription valide avec un cours existant"
try{
    $result = Invoke-RestMethod -Method Post -Uri "$base/api/courses/1/enroll" -Headers $hdr -ContentType 'application/json' -Body '{}'
    Write-Output "SUCCES: Inscription reussie ou deja inscrit"
    $result | ConvertTo-Json
}catch{
    $statusCode = $_.Exception.Response.StatusCode.value__
    if($statusCode -eq 400){
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $responseBody = $reader.ReadToEnd()
        if($responseBody -match "Deja inscrit"){
            Write-Output "INFO: Etudiant deja inscrit a ce cours"
        }else{
            Write-Output "Reponse: $responseBody"
        }
    }else{
        Write-Output "Erreur: $statusCode"
    }
}

Write-Output "`n=== Tests de validation terminés ===`n"

