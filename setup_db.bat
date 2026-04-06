@echo off
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -proot123 --default-character-set=utf8mb4 < "d:\worship-song-library\src\main\resources\sql\schema.sql"
echo Schema done. Exit code: %ERRORLEVEL%
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -proot123 --default-character-set=utf8mb4 < "d:\worship-song-library\src\main\resources\sql\seed_data.sql"
echo Seed done. Exit code: %ERRORLEVEL%
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -proot123 worship_db -e "SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema='worship_db';"
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -proot123 worship_db -e "SELECT COUNT(*) as songs FROM songs; SELECT COUNT(*) as users FROM users; SELECT COUNT(*) as hashtags FROM hashtags;"
