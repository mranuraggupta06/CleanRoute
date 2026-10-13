@echo off
setlocal
echo ========================================================
echo  Starting CleanRoute React Frontend (Port 5173)
echo ========================================================

cd /d "%~dp0frontend"

if exist "..\tools\node-v20.18.0-win-x64\npm.cmd" (
    set "PATH=%~dp0tools\node-v20.18.0-win-x64;%PATH%"
)

npm run dev
pause
