@echo off
setlocal
echo ========================================================
echo   Launching CleanRoute Full-Stack Application
echo ========================================================
echo 1. Starting Java Spring Boot Backend in a new window...
start "CleanRoute Backend (Port 8080)" "%~dp0run-backend.bat"

echo 2. Waiting 3 seconds for backend to initialize...
timeout /t 3 /nobreak >nul

echo 3. Starting React Frontend in a new window...
start "CleanRoute Frontend (Port 5173)" "%~dp0run-frontend.bat"

echo.
echo ========================================================
echo   Both services are starting!
echo   Open your browser at: http://localhost:5173
echo ========================================================
echo.
timeout /t 5
