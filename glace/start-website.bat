@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title Helados Glace

where npm >nul 2>&1
if errorlevel 1 (
  echo npm wurde nicht gefunden. Bitte Node.js installieren und neu versuchen.
  pause
  exit /b 1
)

if not exist "node_modules\next\package.json" (
  echo Installiere Abhaengigkeiten...
  call npm ci
  if errorlevel 1 (
    echo npm ci fehlgeschlagen.
    pause
    exit /b 1
  )
)

echo Starte Helados Glace auf http://127.0.0.1:4387 ...
start "Glace browser" /min cmd /c "call \"%~dp0_open-when-ready.bat\""
call npm run dev
endlocal
