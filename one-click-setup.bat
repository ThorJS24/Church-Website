@echo off
title Salem Church - One Click Setup & Deploy

:: Colors
set "GREEN=[92m"
set "BLUE=[94m"
set "YELLOW=[93m"
set "RED=[91m"
set "RESET=[0m"

echo %GREEN%🏛️  SALEM PRIMITIVE BAPTIST CHURCH%RESET%
echo %BLUE%⚡ ONE-CLICK SETUP & DEPLOY%RESET%
echo.

:: Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo %RED%❌ Node.js required. Install from nodejs.org%RESET%
    pause & exit /b 1
)

:: Install & Build
echo %YELLOW%📦 Installing...%RESET%
npm install >nul 2>&1

echo %YELLOW%🏗️  Building...%RESET%
npm run build >nul 2>&1

:: Deploy to Vercel
echo %YELLOW%🚀 Deploying...%RESET%
vercel --version >nul 2>&1 || npm install -g vercel >nul 2>&1
vercel --prod --yes

echo.
echo %GREEN%✅ DONE! Your church website is live!%RESET%
echo %BLUE%🙏 God bless your ministry!%RESET%
pause