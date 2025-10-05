# 🍽️ Restaurant Concept Project Manager
# ====================================

function Show-Menu {
    Clear-Host
    Write-Host "🍽️ Restaurant Concept Project" -ForegroundColor Green
    Write-Host "============================" -ForegroundColor Green
    Write-Host ""
    Write-Host "اختر الخيار المطلوب:" -ForegroundColor Yellow
    Write-Host "1. تثبيت التبعيات (Install Dependencies)" -ForegroundColor White
    Write-Host "2. تشغيل الخادم التطويري (Start Dev Server)" -ForegroundColor White
    Write-Host "3. تشغيل الباك إند فقط (Backend Only)" -ForegroundColor White
    Write-Host "4. تشغيل الإنتاج (Production)" -ForegroundColor White
    Write-Host "5. فتح في المتصفح (Open in Browser)" -ForegroundColor White
    Write-Host "6. خروج (Exit)" -ForegroundColor Red
    Write-Host ""
}

function Install-Dependencies {
    Write-Host "📦 تثبيت التبعيات..." -ForegroundColor Blue
    npm run install-all
    Write-Host "✅ تم تثبيت التبعيات بنجاح!" -ForegroundColor Green
    Read-Host "اضغط Enter للمتابعة..."
}

function Start-DevServer {
    Write-Host "🚀 تشغيل الخادم التطويري..." -ForegroundColor Blue
    Write-Host "سيتم فتح الخادم على: http://localhost:3000" -ForegroundColor Yellow
    npm run dev
}

function Start-Backend {
    Write-Host "🔧 تشغيل الباك إند فقط..." -ForegroundColor Blue
    npm run backend
}

function Start-Production {
    Write-Host "🌐 تشغيل الإنتاج..." -ForegroundColor Blue
    Write-Host "سيتم فتح الخادم على: http://localhost:3000" -ForegroundColor Yellow
    npm start
}

function Open-Browser {
    Write-Host "🌐 فتح المشروع في المتصفح..." -ForegroundColor Blue
    Start-Process "http://localhost:3000"
    Write-Host "✅ تم فتح المتصفح!" -ForegroundColor Green
    Read-Host "اضغط Enter للمتابعة..."
}

# Main loop
do {
    Show-Menu
    $choice = Read-Host "أدخل رقم الخيار (1-6)"
    
    switch ($choice) {
        "1" { Install-Dependencies }
        "2" { Start-DevServer; break }
        "3" { Start-Backend; break }
        "4" { Start-Production; break }
        "5" { Open-Browser }
        "6" { 
            Write-Host "👋 إلى اللقاء!" -ForegroundColor Yellow
            exit 
        }
        default { 
            Write-Host "❌ خيار غير صحيح!" -ForegroundColor Red
            Read-Host "اضغط Enter للمتابعة..."
        }
    }
} while ($true)