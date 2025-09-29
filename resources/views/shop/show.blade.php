<x-layouts.app :title="$product->title">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="self-start">
            @if($product->images->count())
                <div class="group rounded-2xl overflow-hidden border border-white/10">
                    <img id="product-main-image" src="{{ $product->images->first()->url }}" class="w-full aspect-square object-cover transition group-hover:scale-[1.01]" />
                </div>
                <div class="mt-3">
                    <div id="product-thumbs" class="flex flex-wrap gap-2 py-1">
                        @foreach($product->images as $idx => $img)
                            <button type="button" data-src="{{ $img->url }}" class="thumb-item w-16 h-16 rounded-lg overflow-hidden border {{ $idx === 0 ? 'border-pink-500/50' : 'border-white/10' }} hover:border-pink-500/40 transition focus:outline-none focus:ring-2 focus:ring-pink-600/30">
                                <img src="{{ $img->url }}" class="w-full h-full object-cover" />
                            </button>
                        @endforeach
                    </div>
                </div>
            @else
                <div class="rounded-2xl aspect-square bg-white/5 flex items-center justify-center text-6xl">💍</div>
            @endif
        </div>
        <div class="self-start">
            <div class="flex items-start justify-between gap-4">
                <h1 class="text-3xl font-extrabold">{{ $product->title }}</h1>
                @if($product->stock > 0)
                    <span class="inline-flex items-center gap-1 text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md text-xs">موجود</span>
                @else
                    <span class="inline-flex items-center gap-1 text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md text-xs">ناموجود</span>
                @endif
            </div>
            <div class="text-pink-400 font-extrabold my-3 text-2xl">{{ number_format($product->price) }} <span class="text-sm">تومان</span></div>
            <p class="mb-6 leading-7 text-gray-200">{{ $product->description }}</p>
            <form method="post" action="{{ route('cart.add',$product) }}" class="flex flex-wrap items-center gap-3">
                @csrf
                <x-ui.input type="number" name="quantity" label="تعداد" value="1" min="1" class="w-28" />
                <x-ui.button type="submit" size="lg">افزودن به سبد</x-ui.button>
            </form>
            <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
                    ارسال سریع به سراسر کشور
                </div>
                <div class="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
                    ضمانت کیفیت و اصالت کالا
                </div>
            </div>
        </div>
    </div>

    @push('scripts')
    <script>
    (function(){
      const main = document.getElementById('product-main-image');
      const strip = document.getElementById('product-thumbs');
      if(!main || !strip) return;
      strip.addEventListener('click', function(e){
        const btn = e.target.closest('.thumb-item');
        if(!btn) return;
        const src = btn.getAttribute('data-src');
        if(!src) return;
        // swap image with a quick fade
        main.style.opacity = '0.85';
        const prevActive = strip.querySelector('.thumb-item.border-pink-500\\/50');
        if(prevActive){ prevActive.classList.remove('border-pink-500/50'); prevActive.classList.add('border-white/10'); }
        btn.classList.remove('border-white/10');
        btn.classList.add('border-pink-500/50');
        const img = new Image();
        img.onload = () => {
          main.src = src;
          main.style.transition = 'opacity .18s ease';
          requestAnimationFrame(()=>{ main.style.opacity = '1'; });
        };
        img.src = src;
      });
    })();
    </script>
    @endpush
</x-layouts.app>


