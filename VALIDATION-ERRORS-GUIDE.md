# راهنمای نمایش خطاهای Validation

## ✅ تغییرات انجام شده

### 1. **Component جدید: `<x-ui.errors />`**

یک component قابل استفاده مجدد برای نمایش تمام خطاهای validation ساخته شد.

**استفاده:**

```blade
<x-ui.errors />
```

یا با عنوان سفارشی:

```blade
<x-ui.errors title="لطفاً خطاهای زیر را برطرف کنید:" />
```

### 2. **فرم‌های آپدیت شده**

تمام فرم‌های زیر به‌روزرسانی شدند:

#### ✅ پنل ادمین

-   `admin/products/create.blade.php` - افزودن محصول
-   `admin/products/edit.blade.php` - ویرایش محصول

#### ✅ Authentication

-   `auth/login.blade.php` - ورود
-   `auth/register.blade.php` - ثبت‌نام

#### ✅ Shop

-   `shop/checkout.blade.php` - تسویه حساب

#### ✅ Account

-   `account/settings.blade.php` - تنظیمات حساب کاربری

### 3. **ویژگی‌های اضافه شده**

#### Error Summary (خلاصه خطاها)

-   نمایش تمام خطاها در یک باکس قرمز با آیکون هشدار
-   فهرست bullet point برای خوانایی بهتر
-   رنگ‌بندی واضح و متمایز

#### Old Values (مقادیر قبلی)

تمام input ها حالا مقادیر قبلی را نگه می‌دارند:

```blade
<x-ui.input name="title" :value="old('title')" label="عنوان" />
<x-ui.textarea name="description">{{ old('description') }}</x-ui.textarea>
```

#### Field-Level Errors (خطای هر فیلد)

هر input به صورت جداگانه error خودش را نمایش می‌دهد:

```blade
<x-ui.input name="email" :value="old('email')" label="ایمیل" />
<!-- error 'email' automatically displayed below input -->
```

## 🎨 نمایش خطاها

### نمایش کلی (Summary)

در بالای فرم، یک باکس قرمز نمایش داده می‌شود:

```
⚠️ خطاهای اعتبارسنجی:
• فیلد عنوان الزامی است.
• قیمت باید عددی باشد.
• تصویر نامعتبر است.
```

### نمایش زیر هر فیلد

زیر هر input که خطا دارد، متن قرمز نمایش داده می‌شود:

```
[Email Input Field]
❌ ایمیل وارد شده نامعتبر است.
```

## 📝 نحوه استفاده در فرم‌های جدید

### نسخه کامل (پیشنهادی):

```blade
<form method="post" action="{{ route('...') }}">
    @csrf

    {{-- Error Summary --}}
    <x-ui.errors />

    {{-- Form Fields with old() values --}}
    <x-ui.input name="title" :value="old('title')" label="عنوان" required />
    <x-ui.input name="price" :value="old('price')" label="قیمت" type="number" />
    <x-ui.textarea name="description">{{ old('description') }}</x-ui.textarea>

    {{-- For array fields like images[] --}}
    <x-ui.file name="images[]" label="تصاویر" :multiple="true" />
    @error('images')
        <div class="text-xs text-rose-400">{{ $message }}</div>
    @enderror
    @error('images.*')
        <div class="text-xs text-rose-400">{{ $message }}</div>
    @enderror

    <x-ui.button type="submit">ذخیره</x-ui.button>
</form>
```

### نسخه ساده:

```blade
<form method="post" action="{{ route('...') }}">
    @csrf
    <x-ui.errors />

    <x-ui.input name="email" :value="old('email')" label="ایمیل" />
    <x-ui.input name="password" type="password" label="رمز عبور" />

    <button type="submit">ارسال</button>
</form>
```

## 🎯 Components موجود

### Input

```blade
<x-ui.input
    name="email"
    :value="old('email')"
    label="ایمیل"
    type="email"
    placeholder="example@email.com"
    required
/>
```

### Textarea

```blade
<x-ui.textarea
    name="description"
    label="توضیحات"
    rows="4"
>{{ old('description') }}</x-ui.textarea>
```

### File Upload

```blade
<x-ui.file
    name="images[]"
    label="تصاویر"
    :multiple="true"
    accept="image/*"
/>
```

### Checkbox

```blade
<x-ui.checkbox
    name="is_active"
    label="فعال"
    :checked="old('is_active', true)"
/>
```

### Select

```blade
<x-ui.select name="status" label="وضعیت">
    <option value="pending">در انتظار</option>
    <option value="confirmed">تایید شده</option>
</x-ui.select>
```

## 🐛 رفع مشکلات

### مشکل: خطاها نمایش داده نمی‌شوند

**راه حل:**

1. مطمئن شوید `@csrf` در فرم وجود دارد
2. چک کنید که route صحیح است
3. مطمئن شوید Controller از `$request->validate()` استفاده می‌کند

### مشکل: مقادیر قبلی از بین می‌روند

**راه حل:**
از `:value="old('field_name')"` یا `{{ old('field_name') }}` استفاده کنید

### مشکل: خطای آرایه (مثل images.\*) نمایش داده نمی‌شود

**راه حل:**

```blade
@error('images')
    <div class="text-xs text-rose-400">{{ $message }}</div>
@enderror
@error('images.*')
    <div class="text-xs text-rose-400">{{ $message }}</div>
@enderror
```

## 🎨 سفارشی‌سازی

### تغییر رنگ error box

در component `ui/errors.blade.php`:

```blade
<!-- قرمز فعلی -->
border-rose-500/50 bg-rose-500/10 text-rose-400

<!-- تبدیل به نارنجی -->
border-orange-500/50 bg-orange-500/10 text-orange-400
```

### تغییر سایز آیکون

```blade
<!-- کوچک -->
<svg class="w-4 h-4 text-rose-400 ...">

<!-- متوسط (فعلی) -->
<svg class="w-5 h-5 text-rose-400 ...">

<!-- بزرگ -->
<svg class="w-6 h-6 text-rose-400 ...">
```

## ✨ مزایا

1. ✅ نمایش واضح تمام خطاها
2. ✅ حفظ مقادیر وارد شده توسط کاربر
3. ✅ UI/UX بهتر و حرفه‌ای‌تر
4. ✅ سازگار با تم سایت (رنگ cherry)
5. ✅ قابل استفاده مجدد و ساده
6. ✅ پشتیبانی از RTL
7. ✅ Responsive و mobile-friendly

---

**نکته:** بعد از هر تغییر در فرم‌ها، حتماً تست کنید که validation درست کار می‌کند! 🚀
