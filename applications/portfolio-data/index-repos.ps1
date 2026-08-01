# Index all original devnolife repos (metadata + languages + README excerpt) -> JSON knowledge base.
# Read-only. No cloning. Safe to re-run (overwrites the JSON).
$ErrorActionPreference = 'SilentlyContinue'
$ProgressPreference   = 'SilentlyContinue'

$dir = 'd:\devnolife\tools-ai-data\studio\portfolio-data'
New-Item -ItemType Directory -Force -Path $dir | Out-Null

Write-Host 'Fetching repo list...'
$repos = gh repo list devnolife --limit 400 --json name,description,primaryLanguage,stargazerCount,isPrivate,isFork,isArchived,pushedAt,createdAt,diskUsage,homepageUrl,url | ConvertFrom-Json
$orig  = $repos | Where-Object { -not $_.isFork }
$forks = @($repos | Where-Object { $_.isFork } | ForEach-Object { $_.name })

$out = New-Object System.Collections.ArrayList
$n = 0
foreach ($r in $orig) {
  $n++
  if ($n % 25 -eq 0) { Write-Host "  ...$n / $($orig.Count)" }

  # full language breakdown
  $langs = (gh api "repos/devnolife/$($r.name)/languages" 2>$null) -join ''
  $langList = @()
  if ($langs) { try { $langList = @(($langs | ConvertFrom-Json).PSObject.Properties.Name) } catch {} }

  # README as raw text
  $rm = (gh api "repos/devnolife/$($r.name)/readme" -H 'Accept: application/vnd.github.raw' 2>$null) -join "`n"
  if (-not $rm -or $rm -match '^\s*\{"message":"Not Found"') { $rm = '' }
  # light cleanup: drop md images, html tags; trim
  $rm = $rm -replace '!\[[^\]]*\]\([^)]*\)', '' -replace '<[^>]+>', ''
  $rm = ($rm -replace '[ \t]+', ' ').Trim()
  if ($rm.Length -gt 2600) { $rm = $rm.Substring(0, 2600) }

  [void]$out.Add([pscustomobject]@{
    name            = $r.name
    description     = $r.description
    private         = $r.isPrivate
    primaryLanguage = $r.primaryLanguage.name
    languages       = $langList
    stars           = $r.stargazerCount
    homepage        = $r.homepageUrl
    url             = $r.url
    createdAt       = $r.createdAt
    pushedAt        = $r.pushedAt
    diskMB          = [math]::Round($r.diskUsage / 1024, 1)
    readme          = $rm
  })
}

$payload = [pscustomobject]@{
  generatedAt   = (Get-Date -Format o)
  account       = 'devnolife'
  originalCount = $out.Count
  forkCount     = $forks.Count
  forkNames     = $forks
  repos         = $out
}
$path = Join-Path $dir 'portfolio-index.json'
$payload | ConvertTo-Json -Depth 8 | Out-File -Encoding utf8 $path

Write-Host "DONE. Indexed $($out.Count) original repos (+$($forks.Count) forks listed)."
Write-Host "File: $([math]::Round((Get-Item $path).Length/1KB,1)) KB"
Write-Host "With README: $(($out | Where-Object { $_.readme }).Count) / $($out.Count)"
