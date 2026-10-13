@echo off
setlocal
echo ========================================================
echo  Starting CleanRoute Java Spring Boot Backend (Port 8080)
echo ========================================================

cd /d "%~dp0backend"

if exist "..\tools\apache-maven-3.9.6\bin\mvn.cmd" (
    "..\tools\apache-maven-3.9.6\bin\mvn.cmd" spring-boot:run
) else (
    call mvnw.cmd spring-boot:run
)
pause
