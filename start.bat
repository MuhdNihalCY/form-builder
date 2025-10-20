@echo off
echo 🚀 Starting Task Manager Dashboard...
echo.

REM Check if MongoDB is running
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="1" (
    echo ⚠️  MongoDB is not running. Please start MongoDB first.
    echo    mongod
    echo.
    pause
)

REM Check if node_modules exist
if not exist "backend\node_modules" (
    echo 📦 Installing backend dependencies...
    cd backend
    npm install
    cd ..
)

if not exist "frontend\node_modules" (
    echo 📦 Installing frontend dependencies...
    cd frontend
    npm install
    cd ..
)

echo 🔧 Starting development servers...
echo    Backend:  http://localhost:5001
echo    Frontend: http://localhost:3001
echo.
echo Press Ctrl+C to stop both servers
echo.

REM Start both servers
npm run dev
