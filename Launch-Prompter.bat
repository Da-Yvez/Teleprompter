@echo off
start msedge --app="%~dp0index.html" --start-fullscreen
if %ERRORLEVEL% NEQ 0 (
    start chrome --app="%~dp0index.html" --start-fullscreen
)
if %ERRORLEVEL% NEQ 0 (
    start "" "%~dp0index.html"
)
