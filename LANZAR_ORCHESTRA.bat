@echo off
setlocal enabledelayedexpansion

:: Detectar la raíz del proyecto dinámicamente
set "PROJECT_ROOT=%~dp0"
cd /d "%PROJECT_ROOT%"

echo #################################################
echo #         OBS ORCHESTRA - LANZADOR MAESTRO      #
echo #################################################
echo.
echo Rutas detectadas:
echo [RAIZ] %PROJECT_ROOT%
echo.

:: 1. Verificar Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado. Por favor, instalalo desde nodejs.org
    pause
    exit /b
)

:: 2. Instalar dependencias si no existen carpetas node_modules
if not exist "companion\node_modules" (
    echo [INSTALACION] Instalando dependencias del Companion...
    cd companion && npm install && cd ..
)

if not exist "pwa\node_modules" (
    echo [INSTALACION] Instalando dependencias de la PWA...
    cd pwa && npm install && cd ..
)

echo.
echo #################################################
echo #   ARRANCANDO MOTORES (En ventanas nuevas)     #
echo #################################################
echo.

:: 3. Lanzar Companion en ventana minimizada o nueva
echo [COMPANION] Iniciando motor en puerto 17800...
start "OBS COMPANION" /d "%PROJECT_ROOT%companion" cmd /c "npm run dev"

:: 4. Lanzar PWA en ventana nueva
echo [PWA] Iniciando interfaz en puerto 5173...
start "OBS PWA" /d "%PROJECT_ROOT%pwa" cmd /c "npm run dev"

echo.
echo #################################################
echo #         ¡TODO LISTO, MAESTRO!                 #
echo #################################################
echo.
echo 1. Mira las ventanas que se han abierto.
echo 2. Busca la linea que dice "Network: http://192.168.1.XX:5173".
echo 3. Abre esa direccion en el navegador de tu movil.
echo 4. ¡Disfruta de la orquesta!
echo.
pause
