@echo off
setlocal EnableExtensions
rem Wait until Next is listening, then open the site in the default browser.
for /l %%i in (1,1,60) do (
  powershell -NoProfile -Command "try { $r = Invoke-WebRequest -UseBasicParsing -TimeoutSec 2 http://127.0.0.1:4387/; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }"
  if not errorlevel 1 goto open
  timeout /t 1 /nobreak >nul
)
echo Server nicht erreichbar nach 60s.
exit /b 1

:open
start "" "http://127.0.0.1:4387/"
exit /b 0
