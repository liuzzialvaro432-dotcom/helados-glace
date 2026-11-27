@echo off
setlocal
cd /d "%~dp0"

where npm >nul 2>&1
if errorlevel 1 (
  echo npm nicht gefunden. Bitte Node.js installieren und Terminal neu oeffnen.
  pause
  exit /b 1
)

if not exist "node_modules\next" (
  echo Installiere Abhaengigkeiten...
  call npm ci
  if errorlevel 1 (
    echo npm ci fehlgeschlagen.
    pause
    exit /b 1
  )
)

REM Wenn Port 4387 schon antwortet, nur Browser oeffnen
curl -sf -o NUL --max-time 1 http://127.0.0.1:4387/ >nul 2>&1
if not errorlevel 1 (
  start "" "http://127.0.0.1:4387/"
  exit /b 0
)

echo Starte Helados Glace auf http://127.0.0.1:4387/
start "" "http://127.0.0.1:4387/"
call npm run dev
