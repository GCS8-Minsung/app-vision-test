@echo off
setlocal

set "APP_NAME=Clean Check"
set "APP_DIR=%~dp0"
set "PORT=3000"
set "HOST=127.0.0.1"

cd /d "%APP_DIR%"

echo [%APP_NAME%] Starting development server...
echo Project: %APP_DIR%
echo URL: http://%HOST%:%PORT%
echo.

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm.cmd was not found. Install Node.js first.
  pause
  exit /b 1
)

if not exist "package.json" (
  echo [ERROR] package.json was not found in %APP_DIR%.
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "$listener = Get-NetTCPConnection -LocalPort %PORT% -State Listen -ErrorAction SilentlyContinue; if ($listener) { Write-Host '[ERROR] Port %PORT% is already in use. Run stop-clean-check.bat first, or close the process using that port.'; exit 10 }"
if errorlevel 10 (
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo [%APP_NAME%] node_modules not found. Running npm install...
  call npm.cmd install
  if errorlevel 1 (
    echo [ERROR] npm install failed.
    pause
    exit /b 1
  )
)

start "Clean Check Dev Server" cmd /k "cd /d ""%APP_DIR%"" && npm.cmd run dev -- -H %HOST% -p %PORT%"

timeout /t 4 /nobreak >nul
start "" "http://%HOST%:%PORT%"

echo.
echo [%APP_NAME%] Server window opened. Close that window or run stop-clean-check.bat to stop.
pause
