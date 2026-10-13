@echo off
setlocal enabledelayedexpansion
title CleanRoute - Frontend (React + Vite)
echo ========================================================
echo   Starting CleanRoute React Frontend
echo   URL:  http://localhost:5173
echo ========================================================

cd /d "%~dp0frontend"

if exist "%~dp0tools\node-v20.18.0-win-x64\node.exe" (
    set "PATH=%~dp0tools\node-v20.18.0-win-x64;%PATH%"
)

call npm run dev
pause
