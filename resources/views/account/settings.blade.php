<x-account.layout title="تنظیمات حساب">
    <div class="grid md:grid-cols-2 gap-6">
        <div class="rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 class="font-bold mb-3">اطلاعات پروفایل</h2>
            <form method="post" action="{{ route('account.profile.update') }}" class="space-y-3">
                @csrf
                <x-ui.input name="name" :value="old('name',$user->name)" label="نام" placeholder="نام" required />
                <x-ui.input name="phone" :value="old('phone',$user->phone)" label="شماره تماس" placeholder="مثلاً 0912..." />
                <x-ui.textarea name="address" label="آدرس" rows="4" placeholder="آدرس کامل">{{ old('address',$user->address) }}</x-ui.textarea>
                @if(session('status'))
                    <div class="text-sm text-green-400">{{ session('status') }}</div>
                @endif
                <button class="bg-pink-600 hover:bg-pink-700 text-white rounded px-4 py-2">ذخیره</button>
            </form>
        </div>
        <div class="rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 class="font-bold mb-3">تغییر رمز عبور</h2>
            <form method="post" action="{{ route('account.password.update') }}" class="space-y-3">
                @csrf
                <x-ui.input type="password" name="current_password" label="رمز فعلی" placeholder="" required />
                <x-ui.input type="password" name="password" label="رمز جدید" placeholder="حداقل ۶ کاراکتر" required />
                <x-ui.input type="password" name="password_confirmation" label="تکرار رمز جدید" placeholder="" required />
                @if ($errors->any())
                    <div class="text-sm text-red-400">{{ $errors->first() }}</div>
                @endif
                @if(session('status'))
                    <div class="text-sm text-green-400">{{ session('status') }}</div>
                @endif
                <button class="bg-pink-600 hover:bg-pink-700 text-white rounded px-4 py-2">تغییر رمز</button>
            </form>
        </div>
    </div>
</x-account.layout>


