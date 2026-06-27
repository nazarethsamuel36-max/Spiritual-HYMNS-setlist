Set-Location -LiteralPath 'D:\spiritual setlist\Spiritual-HYMNS-setlist'
$cp = 'target\classes;C:\Users\Lenovo\.m2\repository\com\mysql\mysql-connector-j\8.3.0\mysql-connector-j-8.3.0.jar;C:\Users\Lenovo\.m2\repository\org\slf4j\slf4j-api\2.0.12\slf4j-api-2.0.12.jar;C:\Users\Lenovo\.m2\repository\org\slf4j\slf4j-simple\2.0.12\slf4j-simple-2.0.12.jar;C:\Users\Lenovo\.m2\repository\com\zaxxer\HikariCP\5.1.0\HikariCP-5.1.0.jar'
for ($n = 4; $n -le 10; $n++) {
    Write-Output "===== English #$n ====="
    & java -cp $cp com.worship.util.SongMigrationDryRunProcessor english $n
}
