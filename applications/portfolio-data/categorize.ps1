# Categorize the portfolio index by keyword heuristics over name+description+readme+languages.
$ErrorActionPreference = 'Stop'
$path = 'd:\devnolife\tools-ai-data\studio\portfolio-data\portfolio-index.json'
$data = Get-Content $path -Raw | ConvertFrom-Json
$repos = $data.repos

function Blob($r) {
  (@($r.name, $r.description, ($r.languages -join ' '), $r.readme) -join ' ').ToLower()
}

# category => regex
$cats = [ordered]@{
  'AI / NLP / LLM'          = 'llm|gpt|nlp|paraphrase|parafrase|summari|ringkas|plagiar|turnitin|indobert|mt5|textrank|tf-?idf|cosine|semantic|bert|transformer|hyperopt|prompt|rag|embedding|openai|anthropic|claude'
  'Computer Vision / Image' = 'vision|opencv|image|citra|segmentation|segmentasi|face|interpolation|multimedia|ocr|paddleocr|yolo|detection|cnn'
  'WhatsApp / Bot / Messaging' = 'whatsapp|wa-|wablas|baileys|bot|otp|notif'
  'SaaS / Dashboard / Admin'= 'saas|dashboard|admin|multi-?tenant|panel|kelola|manajemen|management'
  'Document / OCR / Generator' = 'document|dokumen|generate|generator|surat|certificate|sertifikat|pdf|docx|template|rpp|akreditasi'
  'Mobile (RN/Expo/Flutter)'= 'react native|react-native|expo|nativewind|flutter|android|kotlin|swift|mobile'
  'E-commerce / Payment'    = 'e-?commerce|ecommerce|payment|bayar|midtrans|xendit|cart|toko|umkm|distributor|costpilot'
  'Education / LMS / Campus'= 'lms|kurikulum|mahasiswa|kampus|sekolah|school|guru|belajar|learning|education|edukasi|akademik|capstone|skripsi|tajwid'
  'Voting / Government / Civil' = 'voting|pemilu|e-?voting|tally|pilkada|reses|lpka|government|pemerintah|desa'
  'DevTools / CLI / Infra'  = 'cli|mcp|devops|ci/?cd|docker|kubernetes|infra|scaffold|spec-kit|ide|inspector|toolkit|automation|scraper|scrapper|crawl|playwright'
  'Data / ML / Research'    = 'machine learning|ml-|dataset|hadoop|hdfs|prediction|klasifikasi|classifier|research|jurnal|risk|analytics|bilinear|dijkstra'
  'Finance / Fintech'       = 'finance|fintech|ledger|saldo|costpilot|sakti|sultan|kas|keuangan|budget'
}

$assigned = @{}
foreach ($c in $cats.Keys) { $assigned[$c] = New-Object System.Collections.ArrayList }
$uncat = New-Object System.Collections.ArrayList

foreach ($r in $repos) {
  $b = Blob $r
  $hit = $false
  foreach ($c in $cats.Keys) {
    if ($b -match $cats[$c]) { [void]$assigned[$c].Add($r.name); $hit = $true }
  }
  if (-not $hit) { [void]$uncat.Add($r.name) }
}

Write-Host "=== CATEGORY COUNTS (repos can match >1) ==="
foreach ($c in $cats.Keys) {
  '{0,-32} {1}' -f $c, $assigned[$c].Count
}
'{0,-32} {1}' -f 'UNCATEGORIZED', $uncat.Count

Write-Host "`n=== README COVERAGE ==="
$withRm = ($repos | Where-Object { $_.readme }).Count
"With README: $withRm / $($repos.Count)"
"No README  : $(($repos | Where-Object { -not $_.readme }).Count)"

Write-Host "`n=== UNCATEGORIZED NAMES ==="
($uncat | Sort-Object) -join ', '
