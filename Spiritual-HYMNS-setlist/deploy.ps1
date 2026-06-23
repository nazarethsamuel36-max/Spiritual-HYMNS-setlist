# Worship Song Library - Quick Deploy & Start Script
# This script builds, deploys, and starts your app on port 2832

$projectPath = "D:\worship-song-library"
$mavenPath = "C:\Users\Lenovo\.maven\maven-3.9.14\bin\mvn.cmd"
$tomcatPath = "D:\apache-tomcat-10.1.48"
$javaPath = "C:\Program Files\Java\jdk-25"
$warFileName = "worship"

# Set Java environment
$env:JAVA_HOME = $javaPath
$env:JRE_HOME = $javaPath

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "  Worship Song Library - Deploy & Run" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build the project
Write-Host "[1/4] Building project..." -ForegroundColor Yellow
cd $projectPath
& $mavenPath clean package -DskipTests -q

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "SUCCESS: Build complete!" -ForegroundColor Green
Write-Host ""

# Step 2: Stop Tomcat if running
Write-Host "[2/4] Stopping Tomcat (if running)..." -ForegroundColor Yellow
$tomcatProcess = Get-Process | Where-Object { $_.ProcessName -like "*java*" -and $_.CommandLine -like "*catalina*" }
if ($tomcatProcess) {
    Stop-Process -InputObject $tomcatProcess -Force
    Start-Sleep -Seconds 2
    Write-Host "SUCCESS: Tomcat stopped" -ForegroundColor Green
} else {
    Write-Host "INFO: Tomcat not running" -ForegroundColor Cyan
}
Write-Host ""

# Step 3: Deploy WAR file
Write-Host "[3/4] Deploying application..." -ForegroundColor Yellow
$warSource = "$projectPath\target\worship-song-library-1.0-SNAPSHOT.war"
$warDest = "$tomcatPath\webapps\$warFileName.war"

# Remove old deployment
if (Test-Path "$tomcatPath\webapps\$warFileName") {
    Remove-Item -Path "$tomcatPath\webapps\$warFileName" -Recurse -Force
}
if (Test-Path $warDest) {
    Remove-Item -Path $warDest -Force
}

# Copy new WAR
Copy-Item -Path $warSource -Destination $warDest
Write-Host "SUCCESS: Deployed to: $warDest" -ForegroundColor Green
Write-Host ""

# Step 4: Start Tomcat
Write-Host "[4/4] Starting Tomcat..." -ForegroundColor Yellow
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Starting server on port 2832..." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

cd $tomcatPath
& "$tomcatPath\bin\catalina.bat" run
