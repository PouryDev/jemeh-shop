<x-dynamic-component :component="auth()->check() ? 'account.layout' : 'layouts.app'" :title="'سبد خرید'">
    <h1 class="text-xl font-bold mb-4">سبد خرید</h1>
    @php $ids = array_keys($cart); $products = \App\Models\Product::whereIn('id',$ids)->get()->keyBy('id'); $total=0; @endphp
    @if(empty($cart))
        <x-ui.card class="p-4 text-gray-200">سبد خرید خالی است.</x-ui.card>
    @else
        <x-ui.card class="p-4">
            @foreach($cart as $id=>$qty)
                @php $p=$products[$id]??null; if($p){$total += $p->price*$qty;} @endphp
                <div class="flex items-center justify-between border-b border-white/10 py-2">
                    <div class="flex items-center gap-3">
                        <div class="w-14 h-14 rounded bg-white/10 flex items-center justify-center">🛍️</div>
                        <div>
                            <div class="font-bold">{{ $p?->title }}</div>
                            <div class="text-xs text-pink-400">{{ number_format($p?->price ?? 0) }} تومان × {{ $qty }}</div>
                        </div>
                    </div>
                    <form method="post" action="{{ route('cart.remove',$id) }}">
                        @csrf @method('DELETE')
                        <button class="text-red-400 hover:text-red-300">حذف</button>
                    </form>
                </div>
            @endforeach
            <div class="text-right mt-3 font-extrabold text-pink-400">جمع: {{ number_format($total) }} تومان</div>
        </x-ui.card>
        <div class="mt-4 text-left">
            <a href="{{ route('checkout.index') }}" class="bg-pink-500 hover:bg-pink-600 text-white rounded px-4 py-2">ادامه خرید</a>
        </div>
    @endif
</x-dynamic-component>


