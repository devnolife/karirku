<#
.SYNOPSIS
  Jalankan solution.* terhadap input.txt, lalu bandingkan STDOUT dengan expected.txt.
.EXAMPLE
  .\run.ps1 two-sum     # jalankan folder soal 'two-sum'
  .\run.ps1             # folder soal yang terakhir diubah
#>
param(
    [Parameter(Position = 0)]
    [string]$Problem
)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot

function Get-ProblemDir([string]$name) {
    if ($name) {
        $p = Join-Path $root $name
        if (-not (Test-Path $p -PathType Container)) { throw "Folder '$name' tidak ada di practice/." }
        return (Resolve-Path $p).Path
    }
    $skip = @('_template', 'python', 'javascript')
    $latest = Get-ChildItem $root -Directory |
        Where-Object { $skip -notcontains $_.Name } |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1
    if (-not $latest) { throw "Belum ada folder soal. Jalankan: .\new.ps1 <nama>" }
    return $latest.FullName
}

$dir = Get-ProblemDir $Problem
$name = Split-Path $dir -Leaf

$sol = Get-ChildItem $dir -File |
    Where-Object { $_.Name -match '^solution\.(py|js)$' } |
    Select-Object -First 1
if (-not $sol) { throw "Tidak ada solution.py / solution.js di $dir" }

$runner = if ($sol.Extension -eq '.py') { 'python' } else { 'node' }
$inputFile = Join-Path $dir 'input.txt'
if (-not (Test-Path $inputFile)) { New-Item $inputFile -ItemType File | Out-Null }
$expectedFile = Join-Path $dir 'expected.txt'

Write-Host ""
Write-Host "  soal   : $name" -ForegroundColor DarkGray
Write-Host "  runner : $runner $($sol.Name)" -ForegroundColor DarkGray
Write-Host ""

$errFile = [System.IO.Path]::GetTempFileName()
$sw = [System.Diagnostics.Stopwatch]::StartNew()
$actualRaw = Get-Content $inputFile -Raw | & $runner $sol.FullName 2> $errFile
$sw.Stop()
$exit = $LASTEXITCODE
$ms = [int]$sw.ElapsedMilliseconds
$err = Get-Content $errFile -Raw -ErrorAction SilentlyContinue
Remove-Item $errFile -ErrorAction SilentlyContinue

$actual = (($actualRaw -join "`n") -replace "`r`n", "`n").TrimEnd()

if ($exit -ne 0 -and $err) {
    Write-Host "RUNTIME ERROR  (exit $exit, $ms ms)" -ForegroundColor Red
    Write-Host ($err.Trim()) -ForegroundColor Red
    return
}

$hasExpected = (Test-Path $expectedFile) -and ((Get-Content $expectedFile -Raw).Trim())
if (-not $hasExpected) {
    Write-Host "OUTPUT  ($ms ms) — expected.txt kosong, ini hasil mentah:" -ForegroundColor Yellow
    Write-Host $actual
    return
}

$expected = ((Get-Content $expectedFile -Raw) -replace "`r`n", "`n").TrimEnd()

if ($actual -eq $expected) {
    Write-Host "PASS  ($ms ms)" -ForegroundColor Green
}
else {
    Write-Host "FAIL  ($ms ms)" -ForegroundColor Red
    Write-Host ""
    Write-Host "  --- expected ---" -ForegroundColor DarkGray
    ($expected -split "`n") | ForEach-Object { Write-Host "  $_" -ForegroundColor Green }
    Write-Host "  --- actual ---" -ForegroundColor DarkGray
    ($actual -split "`n") | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
}
