$ErrorActionPreference = 'Stop'
$data = Get-Content 'd:\devnolife\tools-ai-data\studio\portfolio-data\portfolio-index.json' -Raw | ConvertFrom-Json
$want = @('saas-whatsapp-dashboard','nivia','mobile-falaq','WindExpoRouter','sakti-dashboard','adminWa','devnolife-dashboard','costpilot','saas-gurupintar','lpka-nextjs-prisma','silva','flutter-dashboard')
foreach ($name in $want) {
  $r = $data.repos | Where-Object { $_.name -eq $name } | Select-Object -First 1
  if (-not $r) { "==== $name : NOT FOUND"; ""; continue }
  $p = if($r.private){'PRIVATE'}else{'public'}
  $rm = if ($r.readme) { ($r.readme -replace '\s+',' ').Trim() } else { '(no readme)' }
  if ($rm.Length -gt 600) { $rm = $rm.Substring(0,600) }
  "==== $name [$p | $($r.primaryLanguage) | $($r.stars)star | $($r.diskMB)MB]"
  if ($r.description) { "desc: $($r.description)" }
  if ($r.homepage)    { "live: $($r.homepage)" }
  "langs: $($r.languages -join ', ')"
  "readme: $rm"
  ""
}
