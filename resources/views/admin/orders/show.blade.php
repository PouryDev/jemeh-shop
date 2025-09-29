<x-admin.layout :title="'سفارش #' . $order->id">
    <h1 class="text-xl font-bold mb-4">سفارش #{{ $order->id }}</h1>
    <div class="grid md:grid-cols-2 gap-6">
        <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h2 class="font-bold mb-2">اقلام</h2>
            @foreach($order->items as $item)
                <div class="flex items-center justify-between border-b py-2">
                    <div>{{ $item->product->title }}</div>
                    <div class="text-sm">{{ $item->quantity }} × {{ number_format($item->unit_price) }}</div>
                </div>
            @endforeach
            <div class="text-right mt-3 font-extrabold text-pink-700">جمع: {{ number_format($order->total_amount) }} تومان</div>
        </div>
        <div class="rounded-xl border border-white/10 bg-white/5 p-4 space-y-4">
            <div>
                <h2 class="font-bold mb-2">اطلاعات مشتری</h2>
                <div class="text-sm">{{ $order->customer_name }} | {{ $order->customer_phone }}</div>
                <div class="text-sm text-[#706f6c]">{{ $order->customer_address }}</div>
            </div>

            <div>
                <h2 class="font-bold mb-2">رسید</h2>
                @if($order->receipt_path)
                    <img src="{{ asset('storage/'.$order->receipt_path) }}" class="rounded max-h-72" />
                @else
                    <div class="text-xs">رسیدی آپلود نشده است.</div>
                @endif
            </div>

            @if($order->invoice)
                <div>
                    <h2 class="font-bold mb-2">فاکتور {{ $order->invoice->invoice_number }}</h2>
                    <div class="text-sm">وضعیت: {{ $order->invoice->status }}</div>
                    <div class="text-sm">مبلغ: {{ number_format($order->invoice->amount) }} تومان</div>
                </div>
                <div>
                    <h3 class="font-bold mb-1">تراکنش‌ها</h3>
                    @forelse($order->invoice->transactions as $tx)
                        <div class="border rounded p-2 mb-2">
                            <div class="text-sm">روش: {{ $tx->method }} | مبلغ: {{ number_format($tx->amount) }}</div>
                            <div class="text-xs">وضعیت: {{ $tx->status }} | ارجاع: {{ $tx->reference }}</div>
                        </div>
                    @empty
                        <div class="text-xs">تراکنشی ثبت نشده.</div>
                    @endforelse
                </div>
                <form method="post" action="{{ route('admin.orders.verify',$order) }}" class="flex gap-2">
                    @csrf
                    <x-ui.input type="number" name="transaction_id" label="ID تراکنش" placeholder="" required />
                    <x-ui.button variant="success" type="submit">تایید پرداخت</x-ui.button>
                </form>
            @endif

            <form method="post" action="{{ route('admin.orders.status',$order) }}" class="grid grid-cols-1 md:grid-cols-3 gap-2">
                @csrf
                <div class="space-y-1">
                    <label class="block text-xs text-gray-300">وضعیت سفارش</label>
                    <select name="status" class="w-full rounded-lg bg-white/5 border border-white/10 focus:border-pink-600 focus:ring-2 focus:ring-pink-600/30 outline-none py-2.5 px-3 text-sm transition">
                        @foreach(['pending','confirmed','cancelled','shipped'] as $st)
                            <option value="{{ $st }}" {{ $order->status === $st ? 'selected' : '' }}>{{ $st }}</option>
                        @endforeach
                    </select>
                </div>
                <div class="self-end">
                    <x-ui.button type="submit">به‌روزرسانی وضعیت</x-ui.button>
                </div>
            </form>
        </div>
    </div>
</x-admin.layout>


