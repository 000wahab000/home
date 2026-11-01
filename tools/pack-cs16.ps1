# Packs your own Steam CS 1.6 install into src/game/cs16.zip for game.js.
# Valve's files: keep this zip local (src/game/ is gitignored).
# Usage: powershell -File tools/pack-cs16.ps1 [-HalfLife "D:\SteamLibrary\steamapps\common\Half-Life"] [-Maps de_dust2,de_home]
param(
    [string]$HalfLife,
    [string[]]$Maps = @('de_dust2')
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression, System.IO.Compression.FileSystem

if (-not $HalfLife) {
    $steam = (Get-ItemProperty 'HKCU:\Software\Valve\Steam').SteamPath
    $libs = @($steam) + (Select-String -Path "$steam/steamapps/libraryfolders.vdf" -Pattern '"path"\s+"(.+)"' |
        ForEach-Object { $_.Matches[0].Groups[1].Value -replace '\\\\', '\' })
    $HalfLife = $libs | ForEach-Object { Join-Path $_ 'steamapps/common/Half-Life' } |
        Where-Object { Test-Path (Join-Path $_ 'cstrike/liblist.gam') } | Select-Object -First 1
    if (-not $HalfLife) { throw 'CS 1.6 not found. Install Counter-Strike in Steam or pass -HalfLife <path>.' }
}
$HalfLife = (Resolve-Path $HalfLife).Path
Write-Host "Using $HalfLife"

# Skip binaries, videos, and every map except the ones asked for.
$skipExt = '.exe', '.dll', '.so', '.dylib', '.avi', '.bik', '.dem', '.log'
$keepMaps = $Maps | ForEach-Object { "$_.bsp" }

$out = Join-Path $PSScriptRoot '../src/game/cs16.zip'
New-Item -ItemType Directory -Force (Split-Path $out) | Out-Null
if (Test-Path $out) { Remove-Item $out }
$zip = [System.IO.Compression.ZipFile]::Open($out, 'Create')
try {
    foreach ($game in 'valve', 'cstrike') {
        $root = Join-Path $HalfLife $game
        Get-ChildItem $root -Recurse -File | ForEach-Object {
            $rel = $_.FullName.Substring($HalfLife.Length + 1) -replace '\\', '/'
            if ($skipExt -contains $_.Extension.ToLower()) { return }
            if ($rel -match '^[^/]+/(media|save|logs|downloads)/') { return }
            if ($rel -match '^[^/]+/maps/[^/]+\.bsp$' -and ($game -eq 'valve' -or $keepMaps -notcontains $_.Name)) { return }
            if ($rel -match '^valve/maps/') { return }
            [void][System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $rel, 'Optimal')
        }
    }
} finally { $zip.Dispose() }
'{0} ({1:N0} MB)' -f $out, ((Get-Item $out).Length / 1MB)
