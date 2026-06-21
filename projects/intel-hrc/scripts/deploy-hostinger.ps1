# Deploy Intel HRC Next.js app to Hostinger (intelhrc.navari.systems)
# Requires: Hostinger MCP enabled in Cursor, or run via Cursor agent with hosting_deployJsApplication

$ErrorActionPreference = "Stop"
$project = Split-Path $PSScriptRoot -Parent
$app = Join-Path $project "app"
$staging = Join-Path $project ".deploy-staging"
$zip = Join-Path $project "deploy.zip"
$envSource = Join-Path $project ".env.local"

if (Test-Path $staging) { Remove-Item $staging -Recurse -Force }
if (Test-Path $zip) { Remove-Item $zip -Force }
New-Item -ItemType Directory -Path $staging | Out-Null

robocopy $app $staging /E /XD node_modules .next .git /XF .env.local tsconfig.tsbuildinfo /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
if ($LASTEXITCODE -ge 8) { throw "robocopy failed with exit code $LASTEXITCODE" }

Get-ChildItem $staging -Recurse -Force | ForEach-Object { $_.Attributes = 'Archive' }

# Production .env for Hostinger build (from parent .env.local, override APP_URL)
$lines = Get-Content $envSource | Where-Object { $_ -notmatch '^HOSTINGER_' -and $_ -notmatch '^#' -and $_ -match '=' }
$prod = @()
foreach ($line in $lines) {
  if ($line -match '^NEXT_PUBLIC_APP_URL=') {
    $prod += 'NEXT_PUBLIC_APP_URL=https://intelhrc.navari.systems'
  } else {
    $prod += $line.Trim()
  }
}
if (-not ($prod -match '^NEXT_PUBLIC_APP_URL=')) {
  $prod = @('NEXT_PUBLIC_APP_URL=https://intelhrc.navari.systems') + $prod
}
$prod | Set-Content -Path (Join-Path $staging '.env')

Push-Location $staging
tar -a -cf $zip *
Pop-Location

Write-Host "Created $zip ($([math]::Round((Get-Item $zip).Length/1MB,2)) MB)"
Write-Host "Deploy via Cursor: hosting_deployJsApplication domain=intelhrc.navari.systems archivePath=$zip"
