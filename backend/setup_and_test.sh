#!/bin/bash
# Compawss AI - Backend Setup and Test Script (Mac/Linux)
# This script helps you set up and test the grounded backend

echo "================================================================================"
echo "  COMPAWSS AI - BACKEND SETUP AND TEST"
echo "================================================================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    echo "Please install Python 3.8+ from https://www.python.org/"
    exit 1
fi

echo "[1/6] Checking Python installation..."
python3 --version
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "[2/6] Creating .env file from template..."
    cp .env.example .env
    echo ""
    echo "IMPORTANT: Please edit backend/.env and add your GEMINI_API_KEY"
    echo "Get your key from: https://aistudio.google.com/app/apikey"
    echo ""
    echo "Press Enter after you've added your API key to backend/.env"
    read -r
else
    echo "[2/6] .env file already exists"
    echo ""
fi

# Install dependencies
echo "[3/6] Installing Python dependencies..."
pip3 install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi
echo ""

# Backup and replace main.py
if [ -f "main_grounded.py" ]; then
    echo "[4/6] Replacing backend with grounded version..."
    if [ -f "main_old.py" ]; then
        echo "  - main_old.py already exists, skipping backup"
    else
        mv main.py main_old.py
        echo "  - Backed up original to main_old.py"
    fi
    mv main_grounded.py main.py
    echo "  - Activated grounded backend"
    echo ""
else
    echo "[4/6] Grounded backend already activated"
    echo ""
fi

# Start backend in background
echo "[5/6] Starting backend server..."
echo "  - Backend will run on http://localhost:8000"
echo "  - Press Ctrl+C to stop the backend"
echo ""

# Start backend in background and save PID
python3 main.py &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 5

# Run tests
echo ""
echo "[6/6] Running automated tests..."
echo ""
python3 test_grounded_backend.py
TEST_RESULT=$?

echo ""
echo "================================================================================"
echo "  SETUP COMPLETE"
echo "================================================================================"
echo ""
echo "Backend is running at: http://localhost:8000"
echo "Backend PID: $BACKEND_PID"
echo ""
echo "Next steps:"
echo "  1. Review test results above"
echo "  2. If tests passed, test with frontend"
echo "  3. Update .env.local to use: VITE_AI_BACKEND_URL=\"http://localhost:8000\""
echo "  4. Restart frontend: npm run dev"
echo ""
echo "To stop the backend, run: kill $BACKEND_PID"
echo ""

# Keep script running
echo "Press Ctrl+C to stop the backend and exit"
wait $BACKEND_PID

# Made with Bob
