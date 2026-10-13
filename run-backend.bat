@echo off
setlocal enabledelayedexpansion
title CleanRoute - Backend Server
echo ========================================================
echo   Starting CleanRoute Java Spring Boot Backend
echo   Port: http://localhost:8080
echo ========================================================

cd /d "%~dp0backend"

if exist "target\cleanroute-backend-1.0.0.jar" (
    echo Starting pre-built Spring Boot JAR...
    java -jar target\cleanroute-backend-1.0.0.jar
) else if exist "..\tools\apache-maven-3.9.6\bin\mvn.cmd" (
    echo Building and starting with Maven...
    "..\tools\apache-maven-3.9.6\bin\mvn.cmd" spring-boot:run
) else (
    echo Starting with Maven Wrapper...
    call mvnw.cmd spring-boot:run
)

pause
