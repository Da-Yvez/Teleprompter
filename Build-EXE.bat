@echo off
title AhasaTV Teleprompter - EXE Builder
color 0A
cls

echo ============================================
echo   AhasaTV Teleprompter - EXE Builder
echo   Powered by PyInstaller + pywebview
echo ============================================
echo.

:: Check Python is installed
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] Python is not installed or not in PATH.
    echo Please install Python from https://python.org and try again.
    pause
    exit /b 1
)

echo [1/3] Checking and installing dependencies...
pip install pywebview pyinstaller --quiet --upgrade
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] Failed to install dependencies.
    pause
    exit /b 1
)
echo       Done.
echo.

echo [2/3] Cleaning previous build files...
if exist build\ rmdir /s /q build
if exist dist\ rmdir /s /q dist
if exist AhasaTV-Teleprompter.spec del /q AhasaTV-Teleprompter.spec
echo       Done.
echo.

echo [3/3] Building EXE (this may take 1-3 minutes)...
echo.

pyinstaller --onefile --windowed ^
  --name "AhasaTV-Teleprompter" ^
  --icon=logo.ico ^
  --add-data "index.html;." ^
  --add-data "style.css;." ^
  --add-data "app.js;." ^
  --add-data "logo.jpg;." ^
  --add-data "logo.ico;." ^
  --add-data "sample_script.txt;." ^
  app.py

if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo [ERROR] Build failed. Check the output above for details.
    pause
    exit /b 1
)

echo.
echo ============================================
echo   BUILD SUCCESSFUL!
echo   Output: dist\AhasaTV-Teleprompter.exe
echo ============================================
echo.

:: Open the dist folder automatically
explorer dist

pause
