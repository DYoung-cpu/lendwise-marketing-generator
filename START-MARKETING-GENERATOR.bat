@echo off
echo ========================================
echo Starting Marketing Generator Servers
echo ========================================
echo.

REM Start Backend Server (port 3001)
echo Starting Backend Server on port 3001...
start "Marketing Generator Backend" wsl.exe -d Ubuntu bash -c "cd '/mnt/c/Users/dyoun/Active Projects' && source .env && node quality-backend.js; exec bash"

REM Wait 3 seconds for backend to start
timeout /t 3 /nobreak >nul

REM Start Frontend Server (port 8080)
echo Starting Frontend Server on port 8080...
start "Marketing Generator Frontend" wsl.exe -d Ubuntu bash -c "cd '/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator' && python3 -m http.server 8080; exec bash"

REM Wait 2 seconds for frontend to start
timeout /t 2 /nobreak >nul

REM Open browser
echo Opening Marketing Generator in browser...
start "" "http://localhost:8080/nano-test.html"

echo.
echo ========================================
echo SERVERS STARTED!
echo ========================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:8080/nano-test.html
echo.
echo Keep the terminal windows open!
echo Press any key to exit this window...
pause >nul
