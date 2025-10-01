<x-layouts.app :title="'ثبت‌نام'">
    <div class="max-w-md mx-auto">
        <div class="rounded-xl border border-white/10 bg-white/5 p-6">
            <h1 class="text-xl font-bold mb-4">ثبت‌نام</h1>
            <form method="post" action="{{ route('auth.register') }}" class="space-y-3">
                @csrf
                <x-ui.input name="name" :value="old('name')" label="نام و نام خانوادگی" placeholder="" required />
                <x-ui.input name="email" type="email" :value="old('email')" label="ایمیل" placeholder="" required />
                <x-ui.input name="password" type="password" label="رمز عبور" placeholder="" required />
                <x-ui.input name="password_confirmation" type="password" label="تکرار رمز عبور" placeholder="" required />
                @if ($errors->any())
                    <div class="text-sm text-red-400">
                        {{ $errors->first() }}
                    </div>
                @endif
                <x-ui.button type="submit" class="w-full">ثبت‌نام</x-ui.button>
            </form>
            <div class="text-xs text-gray-300 mt-3">حساب دارید؟ <a class="text-cherry-400" href="{{ route('login') }}">ورود</a></div>
        </div>
    </div>
</x-layouts.app>


