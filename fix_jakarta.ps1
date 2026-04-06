# Fix all javax.servlet -> jakarta.servlet in Java files
$javaFiles = Get-ChildItem -Path "d:\worship-song-library\src\main\java" -Filter "*.java" -Recurse
foreach ($file in $javaFiles) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    if ($content -match "javax\.servlet") {
        $content = $content -replace "javax\.servlet", "jakarta.servlet"
        [System.IO.File]::WriteAllText($file.FullName, $content)
        Write-Host "Fixed Java: $($file.Name)"
    }
}

# Fix all JSTL taglib URIs in JSP files
$jspFiles = Get-ChildItem -Path "d:\worship-song-library\src\main\webapp" -Filter "*.jsp" -Recurse
foreach ($file in $jspFiles) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $changed = $false
    if ($content -match "http://java\.sun\.com/jsp/jstl/core") {
        $content = $content -replace "http://java\.sun\.com/jsp/jstl/core", "jakarta.tags.core"
        $changed = $true
    }
    if ($content -match "http://java\.sun\.com/jsp/jstl/functions") {
        $content = $content -replace "http://java\.sun\.com/jsp/jstl/functions", "jakarta.tags.functions"
        $changed = $true
    }
    if ($changed) {
        [System.IO.File]::WriteAllText($file.FullName, $content)
        Write-Host "Fixed JSP: $($file.Name)"
    }
}

Write-Host ""
Write-Host "=== All files updated to Jakarta standard ==="
