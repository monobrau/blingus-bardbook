@echo off
setlocal
cd /d "%~dp0"

where py >nul 2>nul
if %ERRORLEVEL%==0 (
  py -3 "scripts\local_server.py" %*
  exit /b %ERRORLEVEL%
)

where python >nul 2>nul
if %ERRORLEVEL%==0 (
  python "scripts\local_server.py" %*
  exit /b %ERRORLEVEL%
)

echo Python 3 is required for local mode.
echo Install from https://www.python.org/downloads/ and re-run start-local.cmd
echo Or install PHP CLI and run:
echo   php -S 127.0.0.1:8765 -t . scripts/local-router.php
exit /b 1
