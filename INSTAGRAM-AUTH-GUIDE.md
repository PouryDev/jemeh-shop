# راهنمای تغییر Authentication به Instagram ID و Phone

## 📝 خلاصه تغییرات

سیستم احراز هویت از **Email/Password** به **Instagram ID + Phone/Password** تغییر کرد.

## 🔄 تغییرات انجام شده

### 1. **Database Migration**

فایل: `database/migrations/2025_10_01_105728_modify_users_table_for_instagram_auth.php`

**تغییرات:**

-   ✅ فیلد `instagram_id` اضافه شد (unique)
-   ✅ فیلد `phone` از nullable به unique و required تبدیل شد
-   ✅ فیلد `email` nullable شد (دیگه استفاده نمی‌شه)
-   ✅ Unique constraint از email حذف شد

### 2. **User Model**

فایل: `app/Models/User.php`

**تغییرات:**

-   ✅ `email` از `fillable` حذف شد
-   ✅ `instagram_id` به `fillable` اضافه شد
-   ✅ Method `getAuthIdentifierName()` اضافه شد که `phone` رو برای authentication استفاده می‌کنه

### 3. **AuthController**

فایل: `app/Http/Controllers/AuthController.php`

**تغییرات در Login:**

```php
// قبل
'email' => 'required|email'

// بعد
'phone' => 'required|string'
```

**تغییرات در Register:**

```php
// قبل
'email' => 'required|email|unique:users,email'

// بعد
'instagram_id' => 'required|string|max:255|unique:users,instagram_id',
'phone' => 'required|string|max:20|unique:users,phone',
```

### 4. **فرم‌های Authentication**

#### Login Form (`auth/login.blade.php`)

```blade
<!-- قبل -->
<x-ui.input name="email" type="email" label="ایمیل" />

<!-- بعد -->
<x-ui.input name="phone" type="tel" label="شماره تلفن" placeholder="09123456789" />
```

#### Register Form (`auth/register.blade.php`)

```blade
<!-- فیلدهای جدید -->
<x-ui.input name="name" label="نام و نام خانوادگی" />
<x-ui.input name="instagram_id" label="آیدی اینستاگرام" placeholder="@username" />
<x-ui.input name="phone" type="tel" label="شماره تلفن" placeholder="09123456789" />
<x-ui.input name="password" type="password" label="رمز عبور" />
<x-ui.input name="password_confirmation" type="password" label="تکرار رمز عبور" />
```

### 5. **Settings Page**

فایل: `resources/views/account/settings.blade.php`

**تغییرات:**

-   Instagram ID و Phone به صورت read-only (غیرقابل ویرایش) نمایش داده می‌شن
-   فقط Name و Address قابل ویرایش هستند

### 6. **Factory و Seeder**

#### UserFactory

```php
'instagram_id' => '@' . fake()->unique()->userName(),
'phone' => '09' . fake()->unique()->numerify('#########'),
```

#### DatabaseSeeder

```php
// Admin
phone: '09123456789'
instagram_id: '@admin'
password: 'password'

// Test User
phone: '09123456790'
instagram_id: '@testuser'
password: 'password'
```

## 🚀 نحوه اجرا

### مرحله 1: Migrate کردن Database

**در محیط Development:**

```bash
php artisan migrate
```

**در محیط Production (با احتیاط!):**

```bash
# اول backup بگیرید!
php artisan migrate --force
```

### مرحله 2: Fresh Seed (اختیاری)

اگر می‌خواهید دیتا از اول بسازید:

```bash
php artisan migrate:fresh --seed
```

### مرحله 3: Clear Cache

```bash
php artisan cache:clear
php artisan config:clear
php artisan view:clear
```

## 👤 کاربران پیش‌فرض

### Admin

-   **شماره تلفن**: `09123456789`
-   **Instagram ID**: `@admin`
-   **رمز عبور**: `password`

### Test User

-   **شماره تلفن**: `09123456790`
-   **Instagram ID**: `@testuser`
-   **رمز عبور**: `password`

## 📱 نحوه استفاده

### ثبت‌نام کاربر جدید:

1. به `/register` برو
2. فیلدها رو پر کن:
    - نام و نام خانوادگی: مثلاً "علی احمدی"
    - آیدی اینستاگرام: مثلاً "@ali_ahmadi"
    - شماره تلفن: مثلاً "09121234567"
    - رمز عبور: حداقل 6 کاراکتر
    - تکرار رمز عبور
3. کلیک روی "ثبت‌نام"

### ورود:

1. به `/login` برو
2. شماره تلفن و رمز عبور رو وارد کن
3. کلیک روی "ورود"

## ⚠️ نکات مهم

### 1. **Migration در Production**

قبل از migrate کردن در production:

-   ✅ حتماً Backup کامل بگیرید
-   ✅ ابتدا در محیط staging تست کنید
-   ✅ بررسی کنید که آیا کاربران فعلی دارید یا نه

### 2. **کاربران موجود**

اگر کاربران قبلی دارید، باید manually برای هر کدوم:

-   Instagram ID تعیین کنید
-   شماره تلفن تعیین کنید

مثال:

```sql
UPDATE users SET
    instagram_id = '@existing_user',
    phone = '09123456788'
WHERE id = 1;
```

### 3. **Validation**

شماره تلفن و Instagram ID باید unique باشن.

### 4. **Phone Format**

فرمت شماره: `09XXXXXXXXX` (11 رقم شروع با 09)

### 5. **Instagram ID Format**

می‌تونه با @ شروع بشه یا نه: `@username` یا `username`

## 🔍 Debugging

### خطای "Phone already taken":

یک کاربر با این شماره قبلاً ثبت‌نام کرده.

### خطای "Instagram ID already taken":

یک کاربر با این آیدی اینستاگرام قبلاً ثبت‌نام کرده.

### خطای "شماره تلفن یا رمز عبور نادرست":

شماره یا رمز عبور اشتباه وارد شده.

## 📊 ساختار جدول Users

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255),
    instagram_id VARCHAR(255) UNIQUE,  -- جدید
    phone VARCHAR(255) UNIQUE,         -- تغییر یافته
    email VARCHAR(255) NULLABLE,       -- nullable شده
    password VARCHAR(255),
    is_admin BOOLEAN DEFAULT false,
    address TEXT NULLABLE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## 🆘 پشتیبانی

اگر مشکلی پیش اومد:

1. **Cache رو پاک کنید:**

    ```bash
    php artisan optimize:clear
    ```

2. **Migration Status رو چک کنید:**

    ```bash
    php artisan migrate:status
    ```

3. **Log ها رو بررسی کنید:**
    ```bash
    tail -f storage/logs/laravel.log
    ```

---

**نکته:** این تغییرات بزرگی در ساختار authentication هستند. حتماً قبل از اعمال در production تست کامل بگیرید! 🚀
