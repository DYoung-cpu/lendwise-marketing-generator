@echo off
echo ========================================
echo Starting Marketing Generator Servers
echo ========================================
echo.

REM Start Backend Server (port 3001)
echo Starting Backend Server on port 3001...
start "Marketing Generator Backend" wsl.exe -d Ubuntu bash -c "cd '/mnt/c/Users/dyoun/Active Projects' && export GEMINI_API_KEY='AIzaSyD7cwQ3dv2BScr9y0GM4lk0sYaVV0Uw1Os' && export ANTHROPIC_API_KEY='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' && node quality-backend.js; exec bash"

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
