@echo off
echo Compiling investigation script...
cd "d:\spiritual setlist"
javac -cp "src\main\java;worship-song-library-runtime\node_modules\*" -d target\classes src\main\java\com\worship\scratch\InvestigateHindiMarathiData.java src\main\java\com\worship\util\DBConnection.java 2>&1
if errorlevel 1 (
    echo Compilation failed. Trying alternative approach...
    echo.
    echo Please run this instead using Maven if available:
    echo mvn compile exec:java -Dexec.mainClass="com.worship.scratch.InvestigateHindiMarathiData"
    echo.
    pause
    exit /b 1
)
echo.
echo Running investigation...
java -cp "target\classes;target\dependency\*" com.worship.scratch.InvestigateHindiMarathiData
pause
