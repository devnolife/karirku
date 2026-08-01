# Pull OCR / CV / image / document repos from the portfolio index for job-desc matching.
$ErrorActionPreference = 'Stop'
$data = Get-Content 'd:\devnolife\tools-ai-data\studio\portfolio-data\portfolio-index.json' -Raw | ConvertFrom-Json
$rx = 'ocr|opencv|vision|image|citra|segmentation|segmentasi|face|interpolation|multimedia|paddle|document|dokumen|generate|surat|certificate|sertifikat|pdf|docx|plagiar|turnitin|preprocess|tesseract|detection|classifier|hyperopt|steg'
$hits = $data.repos | Where-Object {
  (@($_.name,$_.description,($_.languages -join ' '),$_.readme) -join ' ').ToLower() -match $rx
} | Sort-Object { $_.stars } -Descending

"MATCHED: $($hits.Count) repos`n"
foreach ($r in $hits) {
  $priv = if ($r.private) {'PRIVATE'} else {'public'}
  $langs = ($r.languages -join ', ')
  $rm = if ($r.readme) { ($r.readme -replace '\s+',' ').Trim() } else { '(no readme)' }
  if ($rm.Length -gt 320) { $rm = $rm.Substring(0,320) }
  "==== $($r.name)  [$priv | star:$($r.stars) | $($r.primaryLanguage) | $($r.diskMB)MB]"
  if ($r.description) { "desc: $($r.description)" }
  if ($r.homepage)    { "live: $($r.homepage)" }
  "langs: $langs"
  "readme: $rm"
  ""
}
