@echo off
setlocal enabledelayedexpansion
title Salem Primitive Baptist Church - Auto Setup

:: Colors
set "GREEN=[92m"
set "BLUE=[94m"
set "YELLOW=[93m"
set "RED=[91m"
set "RESET=[0m"

echo %BLUE%========================================%RESET%
echo %GREEN%  Salem Primitive Baptist Church%RESET%
echo %GREEN%  Automated Setup Script%RESET%
echo %BLUE%========================================%RESET%
echo.

:: Check Node.js
echo %YELLOW%Checking Node.js...%RESET%
node --version >nul 2>&1
if errorlevel 1 (
    echo %RED%Error: Node.js not found. Please install Node.js 18+ first.%RESET%
    echo Download from: https://nodejs.org
    pause
    exit /b 1
)
echo %GREEN%✓ Node.js found%RESET%

:: Check npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo %RED%Error: npm not found%RESET%
    pause
    exit /b 1
)
echo %GREEN%✓ npm found%RESET%

:: Install dependencies
echo.
echo %YELLOW%Installing dependencies...%RESET%
npm install
if errorlevel 1 (
    echo %RED%Error: Failed to install dependencies%RESET%
    pause
    exit /b 1
)
echo %GREEN%✓ Dependencies installed%RESET%

:: Setup Sanity Studio
echo.
echo %YELLOW%Setting up Sanity Studio...%RESET%
cd studio
npm install
if errorlevel 1 (
    echo %RED%Error: Failed to install Sanity dependencies%RESET%
    cd ..
    pause
    exit /b 1
)
cd ..
echo %GREEN%✓ Sanity Studio ready%RESET%

:: Build project
echo.
echo %YELLOW%Building project...%RESET%
npm run build
if errorlevel 1 (
    echo %RED%Error: Build failed%RESET%
    pause
    exit /b 1
)
echo %GREEN%✓ Project built successfully%RESET%

:: Clean up
echo.
echo %YELLOW%Cleaning up...%RESET%
if exist ".next" rmdir /s /q ".next" >nul 2>&1
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache" >nul 2>&1
echo %GREEN%✓ Cleanup complete%RESET%

:: Success message
echo.
echo %GREEN%========================================%RESET%
echo %GREEN%  🎉 SETUP COMPLETE! 🎉%RESET%
echo %GREEN%========================================%RESET%
echo.
echo %BLUE%Next steps:%RESET%
echo 1. Run: %YELLOW%npm run dev%RESET%
echo 2. Open: %YELLOW%http://localhost:3000%RESET%
echo 3. Login with: %YELLOW%admin@salemprimitivebaptist.org%RESET%
echo.
echo %BLUE%Your church website is ready! 🙏%RESET%
echo.

:: Ask to start dev server
set /p "start=Start development server now? (Y/n): "
if /i "!start!"=="n" goto :end
if /i "!start!"=="no" goto :end

echo.
echo %YELLOW%Starting development server...%RESET%
echo %BLUE%Press Ctrl+C to stop the server%RESET%
echo.
npm run dev

:end
pause