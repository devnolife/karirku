# Verify which candidate live demo URLs are reachable (don't attach dead links).
$ErrorActionPreference = 'SilentlyContinue'
$urls = [ordered]@{
  'capstone (pub repo)'          = 'https://capstone-flax-omega.vercel.app'
  'pikom-ft (pub repo)'          = 'https://pikom-ft.vercel.app'
  'aksi-hijau-admin (pub repo)'  = 'https://aksi-hijau-admin.vercel.app'
  'metito-id (pub repo)'         = 'https://v0-heavy-equipment-e-commerce.vercel.app'
  'sakti-dashboard (PRIV repo)'  = 'https://ft-dashboard-plum.vercel.app'
  'lpka (PRIV repo)'             = 'https://lpka-nextjs-prisma-iota.vercel.app'
  'apro-mksar (PRIV repo)'       = 'https://v0-apro-makassar-form-design.vercel.app'
  'saku-dashboard (PRIV repo)'   = 'https://v0-saku-sultan.vercel.app'
}
foreach ($k in $urls.Keys) {
  $u = $urls[$k]
  try {
    $r = Invoke-WebRequest -Uri $u -Method Head -TimeoutSec 15 -MaximumRedirection 5
    "{0,-32} {1}  {2}" -f $k, $r.StatusCode, $u
  } catch {
    $code = $_.Exception.Response.StatusCode.value__
    if ($code) { "{0,-32} {1}  {2}" -f $k, $code, $u }
    else { "{0,-32} DOWN/ERR  {1}" -f $k, $u }
  }
}
