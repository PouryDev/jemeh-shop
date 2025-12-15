<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="enamad" content="64930557" />

    @php
        $merchant = app()->bound('merchant') ? app('merchant') : null;
        $pageTitle = $merchant?->settings['website_title'] ?? $merchant?->name ?? '64930557';
    @endphp
    <title>{{ $pageTitle }}</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=vazirmatn:400,500,600,700,800,900&display=swap" rel="stylesheet" />

    <!-- Bootstrap User Data -->
    <script>
        window.__USER__ = @json(auth()->user());
        @php
            $merchantId = request()->query('merchant_id');
            if (!$merchantId && app()->bound('merchant')) {
                $merchantId = app('merchant')?->id;
            }
            $merchantData = app()->bound('merchant') ? app('merchant') : null;
        @endphp
        window.__MERCHANT_ID__ = @json($merchantId);
        window.__MERCHANT__ = @json($merchantData);
    </script>

    <!-- Unregister Service Worker in development -->
    <script>
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function(registrations) {
                for(let registration of registrations) {
                    registration.unregister();
                    console.log('Service Worker unregistered');
                }
            });
        }
    </script>

    <!-- Scripts -->
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/react-app.jsx'])
</head>
<body class="font-sans antialiased bg-gray-900 text-white">
    <div id="root"></div>
</body>
</html>
