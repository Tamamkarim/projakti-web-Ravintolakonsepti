@echo off
echo 🍽️ Restaurant Concept Project
echo ============================
echo.
echo اختر الخيار المطلوب:
echo 1. تثبيت التبعيات (Install Dependencies)
echo 2. تشغيل الخادم التطويري (Start Dev Server)
echo 3. تشغيل الباك إند فقط (Backend Only)
echo 4. تشغيل الإنتاج (Production)
echo 5. خروج (Exit)
echo.

set /p choice="أدخل رقم الخيار (1-5): "

if "%choice%"=="1" (
    echo 📦 تثبيت التبعيات...
    npm run install-all
    pause
    goto :start
)

if "%choice%"=="2" (
    echo 🚀 تشغيل الخادم التطويري...
    npm run dev
    pause
)

if "%choice%"=="3" (
    echo 🔧 تشغيل الباك إند فقط...
    npm run backend
    pause
)

if "%choice%"=="4" (
    echo 🌐 تشغيل الإنتاج...
    npm start
    pause
)

if "%choice%"=="5" (
    echo 👋 إلى اللقاء!
    exit
)

echo ❌ خيار غير صحيح!
pause
goto :start

:start
cls
goto :eof