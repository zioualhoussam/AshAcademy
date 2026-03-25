@echo off
REM ASH Educational Center - Quick Deploy Script for Windows
echo.
echo ========================================
echo   ASH Educational Center
echo   Deployment Script
echo ========================================
echo.

:menu
echo Choose deployment platform:
echo.
echo 1. Vercel (Frontend only)
echo 2. Railway (Full stack - Recommended)
echo 3. Render (Full stack)
echo 4. Heroku (Full stack)
echo 5. DigitalOcean (Full control)
echo 6. Local development setup
echo 7. Exit
echo.
set /p choice=Enter choice [1-7]: 

if "%choice%"=="1" goto vercel
if "%choice%"=="2" goto railway
if "%choice%"=="3" goto render
if "%choice%"=="4" goto heroku
if "%choice%"=="5" goto digitalocean
if "%choice%"=="6" goto localdev
if "%choice%"=="7" goto end
goto menu

:vercel
echo.
echo Deploying frontend to Vercel...
cd ASH-Educational-system

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if errorlevel 1 (
    echo Installing Vercel CLI...
    npm install -g vercel
)

vercel --prod
echo.
echo ✅ Frontend deployed! Check Vercel dashboard for URL.
goto menu

:railway
echo.
echo Setting up environment...
cd backend

REM Create .env file if it doesn't exist
if not exist backend\.env (
    echo Creating .env file...
    (
        echo NODE_ENV=production
        echo PORT=8080
        echo SESSION_SECRET=ash-educational-secret-key
        echo DATABASE_URL=./ash_database.db
    ) > backend\.env
    echo ✅ .env file created
)

echo Installing dependencies...
npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    goto menu
)

echo Deploying to Railway...
railway up
echo.
echo ✅ Deployment initiated! Check Railway dashboard for status.
goto menu

:render
echo.
echo ⚠️ Render deployment - Follow DEPLOYMENT.md for detailed instructions
goto menu

:heroku
echo.
echo ⚠️ Heroku deployment - Follow DEPLOYMENT.md for detailed instructions
goto menu

:digitalocean
echo.
echo ⚠️ DigitalOcean deployment - Follow DEPLOYMENT.md for detailed instructions
goto menu

:localdev
echo.
echo Starting development server...
cd backend
npm run dev
goto menu

:end
echo.
echo 👋 Goodbye!
pause
