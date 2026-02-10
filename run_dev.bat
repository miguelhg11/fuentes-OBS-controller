@echo off
echo ===================================================
echo   OBS ORCHESTRA CONTROL - QUICK START (ALPHA)
echo ===================================================
echo.
echo [1/2] Iniciando Companion en segundo plano...
start "OBS Companion" cmd /c "cd companion && npm run dev"
echo [2/2] Iniciando PWA en modo desarrollo...
cd pwa && npm run dev
echo.
echo ===================================================
echo   SISTEMA EN LINEA - ABRE EL MOBILE EN MISMA RED
echo ===================================================
pause
