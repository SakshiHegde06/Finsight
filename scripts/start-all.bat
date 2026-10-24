@echo off
title FinSight Microservices Orchestrator
echo ===================================================================
echo               FinSight - AI-Powered Expense Analyzer
echo                      Microservices Architecture
echo ===================================================================
echo [*] Starting Python FastAPI ML Intelligence Service on port 8000...
start "FinSight ML Service (Port 8000)" cmd /k "%~dp0start-ml-service.bat"

timeout /t 3 >nul

echo [*] Starting Spring Boot REST Backend Service on port 8080...
start "FinSight Backend API (Port 8080)" cmd /k "%~dp0start-backend.bat"

timeout /t 5 >nul

echo [*] Starting React Vite Frontend UI on port 5173...
start "FinSight React UI (Port 5173)" cmd /k "%~dp0start-frontend.bat"

echo ===================================================================
echo [✓] All 3 microservices launched in separate terminal windows:
echo     - React Web UI:      http://localhost:5173
echo     - Spring Boot API:   http://localhost:8080/api/transactions
echo     - FastAPI ML Engine: http://localhost:8000/docs
echo ===================================================================
