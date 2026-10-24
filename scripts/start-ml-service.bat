@echo off
echo ========================================================
echo   Starting FinSight Python FastAPI ML Microservice
echo   Port: 8000
echo ========================================================
cd /d "%~dp0..\ml-service"

if not exist ".venv\Scripts\python.exe" (
    echo [*] Creating Python virtual environment...
    uv venv .venv
    uv pip install -r requirements.txt
    .venv\Scripts\python.exe app\training\train_models.py
)

.venv\Scripts\python.exe run.py
pause
