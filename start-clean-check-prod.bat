@echo off
setlocal

set "APP_NAME=Clean Check"
set "APP_DIR=%~dp0"
set "PORT=3000"
set "HOST=127.0.0.1"
set "NPM=C:\Program Files\nodejs\npm.cmd"

cd /d "%APP_DIR%"

if not exist "package.json" (
  echo [ERROR] package.json was not found in %APP_DIR%.
  exit /b 1
)

if not exist "%NPM%" (
  echo [ERROR] npm.cmd was not found at %NPM%.
  exit /b 1
)

if not exist "node_modules" (
  echo [%APP_NAME%] node_modules not found. Running npm install...
  call "%NPM%" install
  if errorlevel 1 exit /b 1
)

if not exist ".next" (
  echo [%APP_NAME%] .next not found. Running production build...
  call "%NPM%" run build
  if errorlevel 1 exit /b 1
)

echo [%APP_NAME%] Starting production server on http://%HOST%:%PORT%
call "%NPM%" run start -- -H %HOST% -p %PORT%
