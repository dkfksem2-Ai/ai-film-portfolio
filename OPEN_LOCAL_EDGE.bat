@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  start "Portfolio local web server" cmd /k py -3 -m http.server 8787 --bind 127.0.0.1
  timeout /t 2 /nobreak >nul
  start "" msedge.exe "http://127.0.0.1:8787/"
  exit /b
)
where python >nul 2>nul
if %errorlevel%==0 (
  start "Portfolio local web server" cmd /k python -m http.server 8787 --bind 127.0.0.1
  timeout /t 2 /nobreak >nul
  start "" msedge.exe "http://127.0.0.1:8787/"
  exit /b
)
start "" msedge.exe "%~dp0index.html"
echo Python is not installed: opened index.html directly in Edge.
pause
