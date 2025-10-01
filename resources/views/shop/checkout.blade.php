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
            <form method="post" action="{{ route('checkout.place') }}" enctype="multipart/form-data" class="space-y-3">
                @csrf
                <x-ui.input name="customer_name" label="نام و نام خانوادگی" placeholder="" required />
                <x-ui.input name="customer_phone" label="شماره تماس" placeholder="" required />
                <x-ui.textarea name="customer_address" label="آدرس کامل" rows="4" required></x-ui.textarea>
                <x-ui.file name="receipt" label="آپلود فیش واریزی (اختیاری)" accept="image/*" />
                <x-ui.button type="submit">ثبت سفارش</x-ui.button>
            </form>
        </x-ui.card>
    </div>
</x-layouts.app>


