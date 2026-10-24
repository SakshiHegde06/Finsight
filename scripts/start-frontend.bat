@echo off
echo ========================================================
echo   Starting FinSight React Frontend Microservice
echo   Port: 5173
echo ========================================================
cd /d "%~dp0..\frontend"
npm run dev
pause
