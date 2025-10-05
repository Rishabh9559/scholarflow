# PaperCraftor Backend - Start Script
# Run this script to start the backend server

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  PaperCraftor Backend Server  " -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "ERROR: .env file not found!" -ForegroundColor Red
    Write-Host "Please copy .env.example to .env and update the values" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Run this command:" -ForegroundColor Green
    Write-Host "  Copy-Item .env.example .env" -ForegroundColor White
    Write-Host ""
    pause
    exit
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

Write-Host "Starting server in development mode..." -ForegroundColor Green
Write-Host ""
Write-Host "Server will be available at: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

npm run dev
