# Pull dashboard/admin/RBAC/chat-inbox/mobile/realtime/export/WhatsApp repos for job-desc matching.
$ErrorActionPreference = 'Stop'
$data = Get-Content 'd:\devnolife\tools-ai-data\studio\portfolio-data\portfolio-index.json' -Raw | ConvertFrom-Json

$buckets = [ordered]@{
  'Dashboard/Admin/Panel' = 'dashboard|admin|panel|back ?office|management|manajemen|kelola'
  'RBAC/Auth/Roles'       = 'rbac|role|privilege|hak akses|multi-?role|permission|auth\.js|jwt|nextauth|authentication'
  'Chat/Inbox/Messaging'  = 'chat|inbox|pesan|percakapan|conversation|message|ticket|tiket|broadcast'
  'WhatsApp'              = 'whatsapp|wablas|baileys|wa-? ?api|wa gateway'
  'Mobile (RN/Expo/Flutter)' = 'react native|react-native|expo|nativewind|flutter'
  'Realtime/Polling/Notif' = 'real-?time|realtime|websocket|socket\.io|polling|sse|push notification|fcm|notif'
  'Export Excel/PDF'      = 'export|excel|xlsx|spreadsheet|pdf|laporan|report'
  'Omnichannel/CS/Agent'  = 'omnichannel|customer service|cs |agent|cekat|helpdesk|support'
}

foreach ($b in $buckets.Keys) {
  $rx = $buckets[$b]
  $hits = $data.repos | Where-Object {
    (@($_.name,$_.description,($_.languages -join ' '),$_.readme) -join ' ').ToLower() -match $rx
  }
  "#### $b  => $($hits.Count)"
  ($hits | Sort-Object {$_.stars} -Descending | Select-Object -First 14 | ForEach-Object {
    $p = if($_.private){'priv'}else{'pub'}; "   - $($_.name) [$p|$($_.primaryLanguage)|$($_.stars)star|$($_.diskMB)MB]"
  }) -join "`n"
  ""
}
