#!/bin/bash

echo "🔍 بررسی فایل‌های لوگو و آیکون..."
echo ""

# Check logo file
if [ -f "public/images/logo.png" ]; then
    echo "✅ لوگو پیدا شد: public/images/logo.png"
    ls -lh public/images/logo.png
else
    echo "❌ لوگو پیدا نشد!"
    echo "   لطفاً فایل لوگو را در مسیر public/images/logo.png قرار دهید"
fi

echo ""

# Check favicon
if [ -f "public/favicon.ico" ]; then
    echo "✅ Favicon پیدا شد: public/favicon.ico"
    ls -lh public/favicon.ico
else
    echo "❌ Favicon پیدا نشد!"
    echo "   لطفاً فایل favicon را در مسیر public/favicon.ico قرار دهید"
fi

echo ""
echo "📁 برای مشاهده راهنمای کامل، فایل LOGO-SETUP.md را باز کنید"

