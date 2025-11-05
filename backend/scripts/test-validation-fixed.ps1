$ErrorActionPreference = 'Continue'
$base = 'http://localhost:3001'

Write-Output ""
Write-Output "=== Test validation des endpoints ==="
Write-Output ""

# Login student
try{
    $student = Invoke-RestMethod -Method Post -Uri "$base/api/auth/login" -ContentType 'application/json' -Body (@{email='student@example.com'; password='Password123!'} | ConvertTo-Json)
    $token = $student.token
    Write-Output "Student logged in successfully"
}catch{
    Write-Error "Failed to login student: $_"
    exit 1
}

$hdr = @{ Authorization = "Bearer $token" }

# Test 1: Invalid course ID (non-numeric)
Write-Output ""
Write-Output "Test 1: Enrollment with invalid course ID (non-numeric)"
try{
    $body = @{} | ConvertTo-Json
    $result = Invoke-RestMethod -Method Post -Uri "$base/api/courses/abc/enroll" -Headers $hdr -ContentType 'application/json' -Body $body
    Write-Output "FAIL: Validation should have rejected invalid ID"
    $result | ConvertTo-Json
}catch{
    $statusCode = $_.Exception.Response.StatusCode.value__
    if($statusCode -eq 400){
        Write-Output "SUCCESS: Validation rejected invalid ID (HTTP 400)"
        try{
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $responseBody = $reader.ReadToEnd()
            Write-Output "Response: $responseBody"
        }catch{}
    }else{
        Write-Output "Unexpected status code: $statusCode"
    }
}

# Test 2: Invalid course ID for unenroll
Write-Output ""
Write-Output "Test 2: Unenroll with invalid course ID"
try{
    $result = Invoke-RestMethod -Method Delete -Uri "$base/api/courses/xyz/unenroll" -Headers $hdr
    Write-Output "FAIL: Validation should have rejected invalid ID"
    $result | ConvertTo-Json
}catch{
    $statusCode = $_.Exception.Response.StatusCode.value__
    if($statusCode -eq 400){
        Write-Output "SUCCESS: Validation rejected invalid ID (HTTP 400)"
        try{
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $responseBody = $reader.ReadToEnd()
            Write-Output "Response: $responseBody"
        }catch{}
    }else{
        Write-Output "Unexpected status code: $statusCode"
    }
}

# Test 3: Valid enrollment
Write-Output ""
Write-Output "Test 3: Valid enrollment"
try{
    $body = @{} | ConvertTo-Json
    $result = Invoke-RestMethod -Method Post -Uri "$base/api/courses/1/enroll" -Headers $hdr -ContentType 'application/json' -Body $body
    Write-Output "SUCCESS: Enrollment succeeded"
    $result | ConvertTo-Json
}catch{
    $statusCode = $_.Exception.Response.StatusCode.value__
    if($statusCode -eq 400){
        try{
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $responseBody = $reader.ReadToEnd()
            if($responseBody -match "Deja inscrit"){
                Write-Output "INFO: Student already enrolled"
            }else{
                Write-Output "Response: $responseBody"
            }
        }catch{}
    }else{
        Write-Output "Error: $statusCode"
    }
}

Write-Output ""
Write-Output "=== Validation tests completed ==="
Write-Output ""

