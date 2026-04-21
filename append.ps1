param($Source, $Target)
$content = [System.IO.File]::ReadAllText($Source)
[System.IO.File]::AppendAllText($Target, $content, [System.Text.Encoding]::UTF8)
Clear-Content $Source
