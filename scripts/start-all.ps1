# FinSight Microservices PowerShell Orchestrator
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "             FinSight — AI-Powered Expense Analyzer               " -ForegroundColor Yellow
Write-Host "                  Microservices Orchestrator                       " -ForegroundColor Cyan
Write-Host "===================================================================" -ForegroundColor Cyan

$Root = Split-Path -Parent $PSScriptRoot

# 1. Start Python ML Microservice
Write-Host "[1/3] Launching Python FastAPI ML Engine (Port 8000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Root\ml-service'; .\.venv\Scripts\python.exe run.py"

Start-Sleep -Seconds 3

# 2. Start Java Spring Boot Microservice
Write-Host "[2/3] Launching Spring Boot Backend API (Port 8080)..." -ForegroundColor Green
$MvnPath = "C:\projects\tools\maven-mvnd-2.0.0-rc-3-windows-amd64\mvn\bin\mvn.cmd"
if (-not (Test-Path $MvnPath)) { $MvnPath = "mvn" }
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Root\backend'; & '$MvnPath' spring-boot:run"

Start-Sleep -Seconds 5

# 3. Start React Frontend
Write-Host "[3/3] Launching React Vite Frontend UI (Port 5173)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Root\frontend'; npm run dev"

Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "[✓] All FinSight Microservices are booting up!" -ForegroundColor Green
Write-Host "    • Frontend Dashboard:  http://localhost:5173" -ForegroundColor White
Write-Host "    • Spring Boot Backend: http://localhost:8080/api/analytics/summary" -ForegroundColor White
Write-Host "    • Python ML Service:   http://localhost:8000/docs" -ForegroundColor White
Write-Host "===================================================================" -ForegroundColor Cyan
