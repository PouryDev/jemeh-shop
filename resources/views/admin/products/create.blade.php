<x-admin.layout :title="'افزودن محصول'">
    <h1 class="text-xl font-bold mb-4">افزودن محصول</h1>
    <form method="post" action="{{ route('admin.products.store') }}" enctype="multipart/form-data" class="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
        @csrf
        <x-ui.input name="title" label="عنوان" placeholder="" required />
        <x-ui.input name="slug" label="اسلاگ (اختیاری)" placeholder="" />
        <x-ui.textarea name="description" label="توضیحات" rows="4"></x-ui.textarea>
        <div class="grid grid-cols-2 gap-3">
            <x-ui.input type="number" name="price" label="قیمت (تومان)" placeholder="" required />
            <x-ui.input type="number" name="stock" label="موجودی" placeholder="" required />
        </div>
        <x-ui.checkbox name="is_active" label="فعال" checked />
        <x-ui.file name="images[]" label="تصاویر محصول" :multiple="true" accept="image/*" />
        <x-ui.button type="submit">ذخیره</x-ui.button>
    </form>
</x-admin.layout>


