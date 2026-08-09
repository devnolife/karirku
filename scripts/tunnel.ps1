# ============================================================
# tunnel.ps1 — SSH tunnel web (lokal) → engine VM core, lewat JUMP SERVER.
#
# Meneruskan port layanan core ke 127.0.0.1 di mesin ini, supaya .env.local
# (yang menunjuk 127.0.0.1:<port>) bisa menjangkau engine seolah lokal.
#
# PAKAI:
#   1) Isi 4 variabel di bawah (jump + core, user@host).
#   2) Jalankan:  pwsh -File scripts/tunnel.ps1   (atau:  ./scripts/tunnel.ps1)
#   3) Biarkan jendela ini terbuka selama dev. Ctrl+C untuk menutup tunnel.
#
# Butuh OpenSSH client (bawaan Windows 10+). Autentikasi pakai SSH key kamu.
# ============================================================

# --- ISI INI ---------------------------------------------------------------
$JumpUserHost = "<jump_user>@<jump_host>"      # bastion / jump server
$CoreUserHost = "<core_user>@<core_host>"      # VM engine (dilihat DARI jump)
# Kalau butuh key/port non-default:
$SshKey       = ""                              # mis. "$HOME\.ssh\id_ed25519" (kosong = default)
$JumpPort     = 22
# ---------------------------------------------------------------------------

# Port yang diteruskan: LOCAL:CORE_HOST:REMOTE. Core service diasumsikan
# bind di localhost core VM, jadi remote = localhost:<port>.
# Hapus baris yang tidak dipakai (mis. Firecrawl/MinIO kalau tak perlu).
$Forwards = @(
  "5432:localhost:5432",    # Postgres
  "6379:localhost:6379",    # Redis (BullMQ)
  "11434:localhost:11434",  # Ollama
  "4310:localhost:4310",    # Control API (Hunter/queue)
  "9000:localhost:9000",    # MinIO / S3 (opsional)
  "8000:localhost:8000"     # Firecrawl (opsional)
)

$sshArgs = @("-N", "-J", $JumpUserHost)
if ($SshKey) { $sshArgs += @("-i", $SshKey) }
if ($JumpPort -ne 22) { $sshArgs += @("-p", "$JumpPort") }
foreach ($f in $Forwards) { $sshArgs += @("-L", $f) }
$sshArgs += $CoreUserHost

Write-Host "Membuka tunnel via $JumpUserHost → $CoreUserHost ..." -ForegroundColor Cyan
Write-Host ("Forward: " + ($Forwards -join ", ")) -ForegroundColor DarkGray
Write-Host "ssh $($sshArgs -join ' ')" -ForegroundColor DarkGray
& ssh @sshArgs
