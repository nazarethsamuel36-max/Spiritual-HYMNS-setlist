@echo off
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -proot123 worship_db --default-character-set=utf8mb4 < "d:\worship-song-library\src\main\resources\sql\seed_marathi_100.sql"
echo Marathi Seeds done. Exit code: %ERRORLEVEL%
