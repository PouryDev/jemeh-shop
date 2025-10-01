<x-layouts.app :title="'ورود'">
    <div class="max-w-md mx-auto">
        <div class="rounded-xl border border-white/10 bg-white/5 p-6">
            <h1 class="text-xl font-bold mb-4">ورود</h1>
            <form method="post" action="{{ route('auth.login') }}" class="space-y-3">
                @csrf
                <x-ui.input name="email" type="email" :value="old('email')" label="ایمیل" placeholder="example@email.com" required />
                <x-ui.input name="password" type="password" label="رمز عبور" placeholder="" required />
                <x-ui.checkbox name="remember" label="مرا به خاطر بسپار" />
                @error('email')
                    <div class="text-sm text-red-400">{{ $message }}</div>
                @enderror
                <x-ui.button type="submit" class="w-full">ورود</x-ui.button>
            </form>
            <div class="text-xs text-gray-300 mt-3">حساب ندارید؟ <a class="text-pink-400" href="{{ route('register') }}">ثبت‌نام</a></div>
        </div>
    </div>
</x-layouts.app>


