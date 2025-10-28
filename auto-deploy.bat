@echo off
setlocal enabledelayedexpansion
title Salem Church - Auto Deploy

:: Colors
set "GREEN=[92m"
set "BLUE=[94m"
set "YELLOW=[93m"
set "RED=[91m"
set "RESET=[0m"

echo %BLUE%========================================%RESET%
echo %GREEN%  Salem Church - Auto Deploy%RESET%
echo %BLUE%========================================%RESET%
echo.

:: Check if project is built
if not exist ".next" (
    echo %YELLOW%Building project first...%RESET%
    npm run build
    if errorlevel 1 (
        echo %RED%Build failed. Cannot deploy.%RESET%
        pause
        exit /b 1
    )
)

:: Deployment options
echo %BLUE%Choose deployment platform:%RESET%
echo 1. Vercel (Recommended)
echo 2. Netlify
echo 3. Firebase
echo 4. Build only
echo.
set /p "choice=Enter choice (1-4): "

if "!choice!"=="1" goto :vercel
if "!choice!"=="2" goto :netlify
if "!choice!"=="3" goto :firebase
if "!choice!"=="4" goto :build
goto :invalid

:vercel
echo %YELLOW%Deploying to Vercel...%RESET%
vercel --version >nul 2>&1
if errorlevel 1 (
    echo %YELLOW%Installing Vercel CLI...%RESET%
    npm install -g vercel
)
vercel --prod
goto :success

:netlify
echo %YELLOW%Deploying to Netlify...%RESET%
netlify --version >nul 2>&1
if errorlevel 1 (
    echo %YELLOW%Installing Netlify CLI...%RESET%
    npm install -g netlify-cli
)
netlify deploy --prod --dir=out
goto :success

:firebase
echo %YELLOW%Deploying to Firebase...%RESET%
firebase --version >nul 2>&1
if errorlevel 1 (
    echo %YELLOW%Installing Firebase CLI...%RESET%
    npm install -g firebase-tools
)
npm run optimize
firebase deploy
goto :success

:build
echo %YELLOW%Building for production...%RESET%
npm run optimize
echo %GREEN%✓ Build complete! Upload 'out' folder to your hosting provider.%RESET%
goto :end

:invalid
echo %RED%Invalid choice%RESET%
goto :end

:success
echo.
echo %GREEN%========================================%RESET%
echo %GREEN%  🚀 DEPLOYMENT COMPLETE! 🚀%RESET%
echo %GREEN%========================================%RESET%
echo.
echo %BLUE%Your church website is now live! 🙏%RESET%

:end
pause