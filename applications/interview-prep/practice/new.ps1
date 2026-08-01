<#
.SYNOPSIS
  Bikin folder soal latihan baru dari template.
.EXAMPLE
  .\new.ps1 two-sum
  .\new.ps1 parse-logs -Lang js
#>
param(
    [Parameter(Mandatory = $true, Position = 0)]
    [string]$Name,

    [ValidateSet('py', 'js')]
    [string]$Lang = 'py'
)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$dest = Join-Path $root $Name

if (Test-Path $dest) { throw "Folder '$Name' sudah ada di practice/." }

Copy-Item (Join-Path $root '_template') $dest -Recurse

# Simpan hanya solusi sesuai bahasa pilihan.
$drop = if ($Lang -eq 'py') { 'solution.js' } else { 'solution.py' }
$dropPath = Join-Path $dest $drop
if (Test-Path $dropPath) { Remove-Item $dropPath }

Write-Host ""
Write-Host "Dibuat: practice/$Name  (solution.$Lang)" -ForegroundColor Green
Write-Host "Langkah:" -ForegroundColor DarkGray
Write-Host "  1. Tempel soal       -> practice/$Name/problem.md"
Write-Host "  2. Sample input      -> practice/$Name/input.txt"
Write-Host "  3. Expected output   -> practice/$Name/expected.txt"
Write-Host "  4. Tulis kode        -> practice/$Name/solution.$Lang"
Write-Host "  5. Jalankan          -> .\run.ps1 $Name"
Write-Host ""
