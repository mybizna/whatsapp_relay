@echo off

rem Check if Node.js is installed
echo Checking if Node.js is installed...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed. Please install Node.js and try again.
    pause
    exit /b
)

rem Set default version to BASE_VERSION, CUR_VERSION and NEW_VERSION
set "BASE_VERSION=0.01"
set "CUR_VERSION=0.01"
set "NEW_VERSION=0.01"
set "INSTALL=YES"

rem Check if cur_version.txt exists, if yes, read the current version from it
if exist "%USERPROFILE%\WhatsappRelay\cur_version.txt" (
    set /p CUR_VERSION=<"%USERPROFILE%\WhatsappRelay\cur_version.txt"
)

if exist "%USERPROFILE%\WhatsappRelay\new_version.txt" (
    set /p NEW_VERSION=<"%USERPROFILE%\WhatsappRelay\new_version.txt"
)

if "%CUR_VERSION%" neq "%NEW_VERSION%" (
    set "INSTALL=YES"
) else (
    set "INSTALL=NO"
)

if "%BASE_VERSION%"=="%CUR_VERSION%" (
    set "INSTALL=YES"
)

rem Create a working directory in the user's home directory
echo Creating or clearing the working directory in the user's home directory...
set "WORKING_DIR=%USERPROFILE%\WhatsappRelay"
if not exist "%WORKING_DIR%" (
    mkdir "%WORKING_DIR%"
) else (
    rd /s /q "%WORKING_DIR%"
    mkdir "%WORKING_DIR%"
)

if "%INSTALL%"=="YES" (
    rem Fetch the zip folder containing the Node.js project for the current version
    echo Fetching the zip folder containing the Node.js project for version %NEW_VERSION%...
    certutil -urlcache -split -f "https://github.com/mybizna/whatsapp_relay/archive/refs/tags/%NEW_VERSION%.zip" "%WORKING_DIR%\project.zip"

    rem Unzip the project
    echo Unzipping the project...
    expand "%WORKING_DIR%\project.zip" -F:* "%WORKING_DIR%"

    set /p CUR_VERSION=%NEW_VERSION%>"%USERPROFILE%\WhatsappRelay\cur_version.txt"
) else (
    echo The current version is up to date.
)

rem Run npm install
echo Running npm install...
cd /d "%WORKING_DIR%\whatsapp_relay-%CUR_VERSION%"
npm install

rem Run the project
echo Running the project...
npm start




