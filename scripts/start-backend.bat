@echo off
echo ========================================================
echo   Starting FinSight Spring Boot Backend Microservice
echo   Port: 8080
echo ========================================================
cd /d "%~dp0..\backend"

set "MVN_CMD=C:\projects\tools\maven-mvnd-2.0.0-rc-3-windows-amd64\mvn\bin\mvn.cmd"
if not exist "%MVN_CMD%" set "MVN_CMD=mvn"

call "%MVN_CMD%" spring-boot:run
pause
