@echo off
setlocal EnableExtensions
cd /d "%~dp0"

set "DESKTOP=%USERPROFILE%\Desktop"
if exist "%USERPROFILE%\OneDrive\Desktop" set "DESKTOP=%USERPROFILE%\OneDrive\Desktop"
if defined USERPROFILE if exist "%USERPROFILE%\Escritorio" set "DESKTOP=%USERPROFILE%\Escritorio"

set "TARGET=%~dp0start-website.bat"
set "ICON=%~dp0public\icons\icon-512.png"
set "LNK=%DESKTOP%\Glace Website.lnk"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ws = New-Object -ComObject WScript.Shell; ^
   $s = $ws.CreateShortcut('%LNK%'); ^
   $s.TargetPath = '%TARGET%'; ^
   $s.WorkingDirectory = '%~dp0'; ^
   $s.WindowStyle = 1; ^
   $s.Description = 'Helados Glace · Pedidos online (local http://127.0.0.1:4387/)'; ^
   if (Test-Path '%ICON%') { $s.IconLocation = '%ICON%' }; ^
   $s.Save(); ^
   Write-Host ('Shortcut erstellt: %LNK%')"

if errorlevel 1 (
  echo Shortcut konnte nicht erstellt werden.
  pause
  exit /b 1
)

echo.
echo Fertig. Doppelklick auf "Glace Website" auf dem Desktop.
echo Beim ersten Start oeffnet sich die Seite automatisch, sobald der Server bereit ist.
pause
endlocal
