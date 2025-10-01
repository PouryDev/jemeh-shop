<x-layouts.app :title="'تسویه حساب'">
    <h1 class="text-xl font-bold mb-4">تسویه حساب</h1>
    <div class="grid md:grid-cols-2 gap-6">
        <x-ui.card class="p-4">
            <h2 class="font-bold mb-3">جزئیات سفارش</h2>
            @foreach($cart as $id=>$qty)
                @php $p = $products[$id] ?? null; @endphp
                <div class="flex items-center justify-between border-b py-2">
                    <div>{{ $p?->title }}</div>
                    <div class="text-sm">{{ number_format(($p?->price ?? 0)*$qty) }} تومان</div>
                </div>
            @endforeach
            <div class="text-right mt-3 font-extrabold text-cherry-400">جمع: {{ number_format($total) }} تومان</div>
        </x-ui.card>
        <x-ui.card class="p-4">
            <h2 class="font-bold mb-3">اطلاعات تماس و رسید</h2>
            
            @if ($errors->any())
                <div class="rounded-lg border border-rose-500/50 bg-rose-500/10 p-3 mb-4">
                    <div class="flex items-start gap-2">
                        <svg class="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <div class="flex-1">
                            <ul class="text-xs text-rose-300 space-y-1">
                                @foreach ($errors->all() as $error)
                                    <li>{{ $error }}</li>
                                @endforeach
                            </ul>
                        </div>
                    </div>
                </div>
            @endif
            
            <form method="post" action="{{ route('checkout.place') }}" enctype="multipart/form-data" class="space-y-3">
                @csrf
                <x-ui.input 
                    name="customer_name" 
                    :value="old('customer_name', auth()->user()?->name)" 
                    label="نام و نام خانوادگی" 
                    placeholder="" 
                    required 
                />
                <x-ui.input 
                    name="customer_phone" 
                    :value="old('customer_phone', auth()->user()?->phone)" 
                    label="شماره تماس" 
                    placeholder="09123456789" 
                    required 
                />
                <x-ui.textarea 
                    name="customer_address" 
                    label="آدرس کامل" 
                    rows="4" 
                    required
                >{{ old('customer_address', auth()->user()?->address) }}</x-ui.textarea>
                
                @auth
                    <div class="text-xs text-gray-400 bg-white/5 p-2 rounded border border-white/10">
                        💡 اطلاعات شما از حساب کاربری پر شده است. در صورت نیاز می‌توانید ویرایش کنید.
                    </div>
                @endauth
                
                <x-ui.file name="receipt" label="آپلود فیش واریزی (اختیاری)" accept="image/*" />
                <x-ui.button type="submit">ثبت سفارش</x-ui.button>
            </form>
        </x-ui.card>
    </div>
</x-layouts.app>


