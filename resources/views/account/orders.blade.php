<x-account.layout title="سفارش‌های من">
    <div class="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent">
        <div class="px-6 pt-6"><h1 class="text-xl font-bold">سفارش‌های من</h1></div>
        <div class="overflow-x-auto">
        <table class="min-w-[720px] w-full text-sm mt-2">
            <thead>
                <tr class="bg-white/5/50">
                    <th class="p-3 text-right font-semibold text-gray-200">کد</th>
                    <th class="p-3 text-right font-semibold text-gray-200">تاریخ</th>
                    <th class="p-3 text-right font-semibold text-gray-200">مبلغ</th>
                    <th class="p-3 text-right font-semibold text-gray-200">وضعیت</th>
                    <th class="p-3 text-right font-semibold text-gray-200">فاکتور</th>
                    <th class="p-3"></th>
                </tr>
            </thead>
            <tbody class="divide-y divide-white/10">
                @forelse($orders as $order)
                    <tr class="hover:bg-white/5 transition">
                        <td class="p-3 whitespace-nowrap">#{{ $order->id }}</td>
                        <td class="p-3 whitespace-nowrap">{{ $order->created_at->format('Y/m/d') }}</td>
                        <td class="p-3 whitespace-nowrap">{{ number_format($order->total_amount) }} <span class="text-xs text-gray-400">تومان</span></td>
                        <td class="p-3">
                            @php $statusColors = [
                                'pending' => ['text' => 'text-amber-300', 'bg' => 'bg-amber-500/10', 'bd' => 'border-amber-500/20', 'label' => 'در انتظار'],
                                'confirmed' => ['text' => 'text-emerald-300', 'bg' => 'bg-emerald-500/10', 'bd' => 'border-emerald-500/20', 'label' => 'تایید شده'],
                                'cancelled' => ['text' => 'text-rose-300', 'bg' => 'bg-rose-500/10', 'bd' => 'border-rose-500/20', 'label' => 'لغو شده'],
                                'shipped' => ['text' => 'text-sky-300', 'bg' => 'bg-sky-500/10', 'bd' => 'border-sky-500/20', 'label' => 'ارسال شده'],
                            ]; $c = $statusColors[$order->status] ?? $statusColors['pending']; @endphp
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs border {{ $c['bg'] }} {{ $c['bd'] }} {{ $c['text'] }}">
                                <span class="w-1.5 h-1.5 rounded-full {{ str_replace('text','bg',$c['text']) }}"></span>
                                {{ $c['label'] }}
                            </span>
                        </td>
                        <td class="p-3">
                            @if(optional($order->invoice)->invoice_number)
                                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-white/5 border border-white/10">{{ $order->invoice->invoice_number }}</span>
                            @else
                                <span class="text-gray-400">-</span>
                            @endif
                        </td>
                        <td class="p-3 text-left">
                            <a href="{{ route('account.orders.show',$order) }}" class="inline-flex items-center gap-1 text-pink-300 hover:text-pink-200 px-2 py-1 rounded-md hover:bg-pink-500/10 transition">جزئیات</a>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td class="p-4 text-center text-gray-300" colspan="6">سفارشی ثبت نشده است.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
        </div>
        <div class="p-4">{{ $orders->links() }}</div>
    </div>
</x-account.layout>


