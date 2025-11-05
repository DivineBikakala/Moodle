$ErrorActionPreference = 'Stop'
$base = 'http://localhost:3001'
function Save($name, $obj){ $obj | ConvertTo-Json -Depth 10 | Out-File $name -Encoding utf8 }

Write-Output "Starting E2E script against $base"

function GetOrRegister($email, $password, $firstName, $lastName, $role){
    try{
        $resp = Invoke-RestMethod -Method Post -Uri "$base/api/auth/register" -ContentType 'application/json' -Body (@{email=$email; password=$password; firstName=$firstName; lastName=$lastName; role=$role} | ConvertTo-Json)
        return $resp
    }catch{
        # If already exists, try to login
        Write-Output "Register failed for $email, trying login..."
        try{
            $login = Invoke-RestMethod -Method Post -Uri "$base/api/auth/login" -ContentType 'application/json' -Body (@{email=$email; password=$password} | ConvertTo-Json)
            return $login
        }catch{
            throw $_
        }
    }
}

# Register teacher or login
try{
    $teacher = GetOrRegister 'teacher@example.com' 'Password123!' 'Alice' 'Teacher' 'teacher'
    Save 'teacher.json' $teacher
    $teacherToken = $teacher.token
    $teacherId = $teacher.user.id
    Write-Output "Teacher token and id obtained: id=$teacherId"
}catch{ Write-Error "Teacher auth failed: $_"; exit 1 }

# Register student or login
try{
    $student = GetOrRegister 'student@example.com' 'Password123!' 'Bob' 'Student' 'student'
    Save 'student.json' $student
    $studentToken = $student.token
    $studentId = $student.user.id
    Write-Output "Student token and id obtained: id=$studentId"
}catch{ Write-Error "Student auth failed: $_"; exit 1 }

# Create course
try{
    $courseBody = @{ title='Test Course'; description='Description de test'; teacherId=$teacherId; isPublished=$true }
    $course = Invoke-RestMethod -Method Post -Uri "$base/api/courses" -ContentType 'application/json' -Body ($courseBody | ConvertTo-Json -Depth 5)
    Save 'course.json' $course
    $courseId = $course.course.id
    Write-Output "Course created: id=$courseId"
}catch{ Write-Error "Course create failed: $_"; exit 1 }

# Add resource (teacher auth)
try{
    $resourceBody = @{ title='Ressource 1'; description='Desc res'; fileUrl='http://example.com/file.pdf'; fileType='pdf' }
    $hdr = @{ Authorization = "Bearer $teacherToken" }
    $resource = Invoke-RestMethod -Method Post -Uri "$base/api/courses/$courseId/resources" -ContentType 'application/json' -Headers $hdr -Body ($resourceBody | ConvertTo-Json -Depth 5)
    Save 'resource.json' $resource
    Write-Output "Resource added"
}catch{ Write-Error "Resource add failed: $_"; exit 1 }

# Enroll student
try{
    $hdr2 = @{ Authorization = "Bearer $studentToken" }
    $enroll = Invoke-RestMethod -Method Post -Uri "$base/api/courses/$courseId/enroll" -ContentType 'application/json' -Headers $hdr2 -Body (ConvertTo-Json @{})
    Save 'enroll.json' $enroll
    Write-Output "Student enrolled"
}catch{ Write-Error "Enroll failed: $_"; exit 1 }

# Get my-courses
try{
    $mycourses = Invoke-RestMethod -Method Get -Uri "$base/api/my-courses" -Headers $hdr2
    Save 'mycourses.json' $mycourses
    Write-Output "My courses retrieved"
    $mycourses | ConvertTo-Json -Depth 10
}catch{ Write-Error "Get my-courses failed: $_"; exit 1 }

Write-Output "E2E completed, outputs saved: teacher.json, student.json, course.json, resource.json, enroll.json, mycourses.json"
