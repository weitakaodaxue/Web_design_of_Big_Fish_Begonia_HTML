$root = "d:\放代码\大鱼海棠\html"
Get-ChildItem -Path $root -Filter 'page*.html' | Sort-Object Name | ForEach-Object {
    $path = $_.FullName
    $text = Get-Content -Path $path -Raw
    $orig = $text

    # Remove the audio element block
    $text = [regex]::Replace($text, '(?s)<audio\s+id="audioElementId".*?</audio>\s*', '')

    # Remove shared JS snippets
    $text = [regex]::Replace($text, '(?s)if\s*\(localStorage\.getItem\(\'isLoggedIn\'\)\s*!==\s*\'true\'\)\s*\{.*?window\.location\.href\s*=.*?;.*?\}\s*', '')
    $text = [regex]::Replace($text, '(?s)function\s+saveCurrentPlayTime\s*\(\)\s*\{.*?\}\s*', '')
    $text = [regex]::Replace($text, '(?s)function\s+setCurrentPlayTime\s*\(\)\s*\{.*?\}\s*', '')
    $text = [regex]::Replace($text, '(?s)window\.onload\s*=\s*saveCurrentPlayTime\s*;\s*', '')

    # Remove empty <script> blocks left behind
    $text = [regex]::Replace($text, '(?s)<script>\s*</script>\s*', '')

    # Add common.js include if missing
    if ($text -notmatch '<script\s+src="\.\./js/common\.js"\s*>\s*</script>') {
        $text = $text -replace '</body>', '    <script src="../js/common.js"></script>`n</body>'
    }

    if ($text -ne $orig) {
        Set-Content -Path $path -Value $text -Encoding utf8
        Write-Host "$($_.Name) updated"
    } else {
        Write-Host "$($_.Name) unchanged"
    }
}
