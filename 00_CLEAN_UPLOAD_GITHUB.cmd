@echo off
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0\00_CLEAN_UPLOAD_GITHUB.ps1"
echo.
pause
