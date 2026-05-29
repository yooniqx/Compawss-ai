@echo off
REM Compawss AI - Backend Setup and Test Script (Windows)
REM This script helps you set up and test the grounded backend

echo ================================================================================
echo   COMPAWSS AI - BACKEND SETUP AND TEST
echo ================================================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org/
    pause
    exit /b 1
)

echo [1/6] Checking Python installation...
python --version
echo.

REM Check if .env file exists
if not exist ".env" (
    echo [2/6] Creating .env file from template...
    copy .env.example .env
    echo.
    echo IMPORTANT: Please edit backend\.env and add your GEMINI_API_KEY
    echo Get your key from: https://aistudio.google.com/app/apikey
    echo.
    echo Press any key after you've added your API key to backend\.env
    pause
) else (
    echo [2/6] .env file already exists
    echo.
)

REM Install dependencies
echo [3/6] Installing Python dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo.

REM Backup and replace main.py
if exist "main_grounded.py" (
    echo [4/6] Replacing backend with grounded version...
    if exist "main_old.py" (
        echo   - main_old.py already exists, skipping backup
    ) else (
        move main.py main_old.py
        echo   - Backed up original to main_old.py
    )
    move main_grounded.py main.py
    echo   - Activated grounded backend
    echo.
) else (
    echo [4/6] Grounded backend already activated
    echo.
)

REM Start backend in background
echo [5/6] Starting backend server...
echo   - Backend will run on http://localhost:8000
echo   - Press Ctrl+C to stop the backend
echo.
start "Compawss Backend" python main.py

REM Wait for backend to start
echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

REM Run tests
echo.
echo [6/6] Running automated tests...
echo.
python test_grounded_backend.py

echo.
echo ================================================================================
echo   SETUP COMPLETE
echo ================================================================================
echo.
echo Backend is running at: http://localhost:8000
echo.
echo Next steps:
echo   1. Review test results above
echo   2. If tests passed, test with frontend
echo   3. Update .env.local to use: VITE_AI_BACKEND_URL="http://localhost:8000"
echo   4. Restart frontend: npm run dev
echo.
echo To stop the backend, close the "Compawss Backend" window
echo.
pause

@REM Made with Bob
