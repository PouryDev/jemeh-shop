<x-layouts.app :title="'جمه‌شاپ - اکسسوری‌های خاص و ترند'">
    <section class="rounded-xl border border-white/10 p-6 bg-gradient-to-br from-white/5 to-white/0">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <h1 class="text-2xl md:text-3xl font-extrabold">اکسسوری‌های خاص برای استایل مینیمال</h1>
                <p class="text-sm text-gray-300 mt-1">ترندهای روز، کیفیت بالا، ارسال سریع</p>
            </div>
            <form method="get" class="w-full md:w-80">
                <input name="q" value="{{ request('q') }}" placeholder="جستجوی محصول، مثل: دستبند نقره" class="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-600" />
            </form>
        </div>
    </section>

    @if($products->isEmpty())
        <div class="mt-8 rounded-xl border border-white/10 bg-white/5 p-8 text-center text-gray-300">
            محصولی پیدا نشد. جستجو را تغییر دهید یا به زودی سر بزنید.
        </div>
    @endif

    <div class="shop-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-6">
        @foreach($products as $product)
            @php $img = optional($product->images->first())->url ?? null; @endphp
            <div class="group relative rounded-xl overflow-hidden border border-white/10 bg-white/5">
                <a href="{{ route('shop.show', $product) }}" class="block z-0">
                    @if($img)
                        <img src="{{ $img }}" alt="{{ $product->title }}" class="w-full aspect-square object-cover transition group-hover:scale-[1.03]" />
                    @else
                        <div class="w-full aspect-square bg-white/5 flex items-center justify-center text-4xl">🪞</div>
                    @endif
                    <div class="p-3 pointer-events-none">
                        <div class="font-semibold truncate">{{ $product->title }}</div>
                        <div class="text-pink-400 text-sm mt-1">{{ number_format($product->price) }} تومان</div>
                    </div>
                </a>
                <div class="absolute left-3 right-3 bottom-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition z-10">
                    <button data-add-to-cart data-url="{{ route('cart.add',$product) }}" data-qty="1" class="w-full bg-pink-600/90 hover:bg-pink-700 text-white rounded-md py-1.5 text-xs shadow-lg backdrop-blur">افزودن به سبد</button>
                </div>
            </div>
        @endforeach
    </div>
    <div class="mt-6">{{ $products->links() }}</div>
</x-layouts.app>


