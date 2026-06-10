@echo off
setlocal

set "APP_NAME=Clean Check"
set "APP_DIR=%~dp0"
set "PORT=3000"

cd /d "%APP_DIR%"

echo [%APP_NAME%] Stopping development server on port %PORT%...
echo Project: %APP_DIR%
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "$app = (Resolve-Path '%APP_DIR%').Path; $listeners = Get-NetTCPConnection -LocalPort %PORT% -State Listen -ErrorAction SilentlyContinue; if (-not $listeners) { Write-Host '[Clean Check] No running server was found on port %PORT%.'; exit 0 }; $targets = @(); foreach ($processId in ($listeners | Select-Object -ExpandProperty OwningProcess -Unique)) { $proc = Get-CimInstance Win32_Process -Filter \"ProcessId=$processId\" -ErrorAction SilentlyContinue; if ($proc -and $proc.CommandLine -and (($proc.CommandLine -like \"*$app*\") -or ($proc.CommandLine -match 'next(\\.cmd)?\\s+dev|next\\\\dist\\\\bin\\\\next'))) { $targets += $proc } }; if (-not $targets) { Write-Warning 'A process is listening on port %PORT%, but it does not look like this Clean Check dev server. Nothing was stopped.'; exit 2 }; foreach ($target in $targets) { Stop-Process -Id $target.ProcessId -Force; Write-Host ('[Clean Check] Stopped PID ' + $target.ProcessId) }"

if errorlevel 2 (
  pause
  exit /b 1
)

echo.
echo [%APP_NAME%] Stop command completed.
pause
