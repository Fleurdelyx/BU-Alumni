@echo off
echo ================================================  
echo    SECURITY FIX: API Key Setup Instructions
echo ================================================
echo.

echo \ud83d\ude28 CRITICAL: Your Google API key was exposed publicly!
echo.
echo \ud83d\udd25 IMMEDIATE ACTIONS REQUIRED:
echo.

echo 1. REVOKE THE EXPOSED API KEY:
echo    \u2192 Go to: https://console.developers.google.com/apis/credentials
echo    \u2192 Find: AIzaSyB8NmL2bXxa4mynaFgoNj0A-0qELtSwxE4
echo    \u2192 DELETE IT immediately!
echo.

echo 2. CREATE NEW API KEY:
echo    \u2192 Generate new key at: https://aistudio.google.com/app/apikey  
echo    \u2192 Copy your new API key
echo.

echo 3. SETUP LOCAL ENVIRONMENT:
echo    \u2192 Copy .env.example to .env
echo    \u2192 Add your NEW API key to .env
echo    \u2192 NEVER commit .env to Git!
echo.

echo 4. SETUP GITHUB SECRETS:
echo    \u2192 Go to: https://github.com/Fleurdelyx/BU-Alumni/settings/secrets/actions
echo    \u2192 Add new secret: GOOGLE_API_KEY
echo    \u2192 Paste your NEW API key as the value
echo.

echo ================================================
echo.

set /p newkey="Enter your NEW Google API key (or press Enter to skip): "

if not "%newkey%"=="" (
    echo.
    echo Creating .env file with your new API key...
    echo GOOGLE_API_KEY=%newkey% > .env
    echo FIREBASE_API_KEY=your_firebase_api_key_here >> .env
    echo.
    echo \u2713 .env file created!
    echo \u2713 Your API key is now secure locally
    echo.
    echo NEXT: Add GOOGLE_API_KEY to GitHub Secrets!
    echo       https://github.com/Fleurdelyx/BU-Alumni/settings/secrets/actions
) else (
    echo.
    echo Manual setup: Copy .env.example to .env and edit it with your API key
)

echo.
pause