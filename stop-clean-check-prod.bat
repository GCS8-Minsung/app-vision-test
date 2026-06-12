@echo off
setlocal

set "SERVICE_NAME=clean-check"
set "NSSM=C:\ProgramData\chocolatey\bin\nssm.exe"

if exist "%NSSM%" (
  "%NSSM%" stop %SERVICE_NAME%
  exit /b %ERRORLEVEL%
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "$listeners = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue; foreach ($processId in ($listeners | Select-Object -ExpandProperty OwningProcess -Unique)) { Stop-Process -Id $processId -Force }"
