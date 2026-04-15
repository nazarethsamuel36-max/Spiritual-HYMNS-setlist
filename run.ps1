# Quick Worship App Server Script
# This script starts Tomcat or runs the app directly

param(
    [string]$Action = "build"
)

$projectPath = "D:\worship-song-library"
$mavenPath = "C:\Users\Lenovo\.maven\maven-3.9.14\bin\mvn.cmd"

function Build {
    Write-Host "🔨 Building project..." -ForegroundColor Green
    & $mavenPath clean package -DskipTests
    Write-Host "✅ Build complete! WAR file: $projectPath\target\worship-song-library-1.0-SNAPSHOT.war" -ForegroundColor Green
}

function Help {
    Write-Host @"
Worship Song Library - Quick Start

Usage: .\run.ps1 -Action <action>

Actions:
  build       Build the project (default)
  help        Show this message
  test        Run tests
  compile     Compile only

Examples:
  .\run.ps1 -Action build
  .\run.ps1 -Action test
  .\run.ps1 -Action compile

Next steps after build:
  1. Download Apache Tomcat 10: https://tomcat.apache.org/download-10.cgi
  2. Extract to C:\apache-tomcat-10.1.28
  3. Copy target\worship-song-library-1.0-SNAPSHOT.war to tomcat\webapps\worship.war
  4. Run: C:\apache-tomcat-10.1.28\bin\catalina.bat run
  5. Open: http://localhost:8080/worship
"@
}

function Compile {
    Write-Host "🔨 Compiling project..." -ForegroundColor Green
    & $mavenPath clean compile
    Write-Host "✅ Compile complete!" -ForegroundColor Green
}

function Test {
    Write-Host "🧪 Running tests..." -ForegroundColor Green
    & $mavenPath clean test
    Write-Host "✅ Tests complete!" -ForegroundColor Green
}

# Execute action
switch ($Action.ToLower()) {
    "build" { Build }
    "test" { Test }
    "compile" { Compile }
    "help" { Help }
    default { Build }
}
