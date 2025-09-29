<x-admin.layout :title="'ویرایش محصول'">
    <h1 class="text-xl font-bold mb-4">ویرایش محصول</h1>
    <form method="post" action="{{ route('admin.products.update', $product) }}" enctype="multipart/form-data" class="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
        @csrf
        @method('PUT')
        @foreach ($errors->all() as $error)
            <div class="text-red-500">{{ $error }}</div>
        @endforeach
        <x-ui.input name="title" :value="old('title',$product->title)" label="عنوان" required />
        <x-ui.input name="slug" :value="old('slug',$product->slug)" label="اسلاگ" required />
        <x-ui.textarea name="description" label="توضیحات" rows="4">{{ old('description',$product->description) }}</x-ui.textarea>
        <div class="grid grid-cols-2 gap-3">
            <x-ui.input type="number" name="price" :value="old('price',$product->price)" label="قیمت (تومان)" required />
            <x-ui.input type="number" name="stock" :value="old('stock',$product->stock)" label="موجودی" required />
        </div>
        <x-ui.checkbox name="is_active" label="فعال" :checked="$product->is_active" />
        <x-ui.file name="images[]" label="افزودن تصاویر جدید" :multiple="true" accept="image/*" />
        <div class="flex gap-2 flex-wrap">
            @foreach($product->images as $img)
                <img src="{{ $img->url }}" class="w-16 h-16 rounded object-cover" />
            @endforeach
        </div>
        <x-ui.button type="submit">ذخیره</x-ui.button>
    </form>
</x-admin.layout>


