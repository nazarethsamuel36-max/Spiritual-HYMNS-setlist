$files = Get-ChildItem -Path "D:\worship-song-library\scratch_english*.md"
$numbers = @()
foreach ($file in $files) {
    $content = Get-Content $file.FullName
    foreach ($line in $content) {
        if ($line -match '^### (\d+)') {
            $numbers += [int]$Matches[1]
        }
    }
}
$sorted = $numbers | Sort-Object | Get-Unique
Write-Host "Total songs found: $($sorted.Count)"
Write-Host "Song numbers:"
$sorted | ForEach-Object { Write-Host $_ }
