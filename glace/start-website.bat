@echo off
cd /d "%~dp0"
title Helados Glace - local
echo Starting Helados Glace on http://127.0.0.1:4387 ...
start "" cmd /c "timeout /t 3 /nobreak >nul & start http://127.0.0.1:4387/"
call npm run dev
