<!DOCTYPE html>
<html lang="fa" dir="rtl">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>{{ $title ?? 'جمه‌شاپ' }}</title>
        @vite(['resources/css/app.css','resources/js/app.js'])
        
        <style>
            body { font-family: Vazirmatn, var(--font-sans); }
            .cute { background: linear-gradient(135deg,#ff8bd3,#ffd1e8); }
        </style>
    </head>
    <body class="bg-[#fff2f8] min-h-screen">
        <header class="cute shadow p-4">
            <div class="max-w-5xl mx-auto flex items-center justify-between">
                <a href="/" class="text-2xl font-extrabold">✨ جمه‌شاپ ✨</a>
                <nav class="flex items-center gap-4 text-sm">
                    <a href="/" class="hover:underline">خانه</a>
                    <a href="{{ route('cart.index') }}" class="hover:underline">سبد خرید</a>
                </nav>
            </div>
        </header>
        <main class="max-w-5xl mx-auto p-4">
            {{ $slot }}
        </main>
        <footer class="p-6 text-center text-xs text-[#706f6c]">با عشق برای دخترخاله 💖</footer>
    </body>
 </html>


