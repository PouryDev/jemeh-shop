# راهنمای راه‌اندازی SaaS Multi-Tenant

## مراحل راه‌اندازی

### 1. اجرای Migrations

```bash
php artisan migrate
```

این دستور تمام migration‌ها را اجرا می‌کند از جمله:

-   ایجاد جداول merchants, plans, subscriptions, themes, commissions
-   اضافه کردن merchant_id به تمام جداول موجود
-   تبدیل داده‌های موجود به یک merchant پیش‌فرض

### 2. اجرای Seeders

```bash
php artisan db:seed
```

این دستور:

-   پلن‌ها (Basic, Professional, Enterprise) را ایجاد می‌کند
-   تم‌ها (default, modern, minimal) را ایجاد می‌کند
-   داده‌های نمونه را ایجاد می‌کند

### 3. تنظیمات Environment

در فایل `.env` این متغیرها را تنظیم کنید:

```env
APP_MAIN_DOMAIN=yourdomain.com
```

### 4. تنظیمات Nginx برای Wildcard Subdomain

برای پشتیبانی از subdomain‌ها، باید Nginx را تنظیم کنید:

```nginx
server {
    listen 80;
    server_name *.yourdomain.com yourdomain.com;

    root /path/to/your/project/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

### 5. تنظیمات Cron Jobs

برای اجرای خودکار Jobs، این خط را به crontab اضافه کنید:

```bash
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

### 6. ساختار پلن‌ها

#### پلن پایه (Basic)

-   Subdomain: `merchant.yourdomain.com`
-   حداکثر 20 محصول
-   حداکثر 2 اسلاید
-   حداکثر 2 روش ارسال
-   بدون دسترسی به Analytics
-   بدون Product Variants
-   بدون Campaigns
-   بدون اعلان تلگرام
-   کمیسیون 10% از فروش

#### پلن حرفه‌ای (Professional)

-   دامنه سفارشی
-   دسترسی به تمام تم‌ها
-   Analytics پایه (فقط فروش)
-   اعلان تلگرام
-   حداکثر 5 اسلاید
-   حداکثر 5 روش ارسال
-   Product Variants
-   Campaigns
-   بدون کمیسیون

#### پلن سازمانی (Enterprise)

-   تمام امکانات پلن حرفه‌ای
-   Analytics کامل
-   بدون محدودیت در تعداد محصولات، اسلایدها و روش‌های ارسال

## API Endpoints

### SaaS Routes (Public)

-   `GET /api/saas/plans` - لیست پلن‌ها
-   `POST /api/saas/register` - ثبت‌نام merchant جدید
-   `POST /api/saas/subscribe` - تغییر پلن

### Merchant Routes

-   `GET /api/merchant/info` - اطلاعات merchant فعلی
-   `GET /api/merchant/theme` - تم merchant فعلی
-   `GET /api/merchant/themes` - لیست تم‌های در دسترس
-   `PUT /api/merchant/theme` - تغییر تم (نیاز به authentication)

## استفاده از Theme System

تم‌ها در `resources/js/themes/` قرار دارند. هر تم شامل:

-   `components/` - کامپوننت‌های تم
-   `theme.config.js` - تنظیمات تم

برای استفاده از تم در کامپوننت‌ها:

```javascript
import { loadThemeComponent } from "../utils/themeLoader";

const Header = await loadThemeComponent("components/Header");
```

## محدودیت‌های پلن

محدودیت‌ها به صورت خودکار در Controllers چک می‌شوند:

-   `ChecksPlanLimits` trait برای چک کردن محدودیت‌ها
-   `FeatureGateService` برای دسترسی به فیچرها
-   `EnsureFeatureEnabled` middleware برای route‌ها

## Commission System

برای پلن Basic، کمیسیون به صورت خودکار هنگام ثبت سفارش محاسبه می‌شود و در جدول `commissions` ذخیره می‌شود.

## Subscription Management

-   Jobs برای تمدید خودکار و یادآوری‌ها در `routes/console.php` تنظیم شده‌اند
-   Subscription Service برای مدیریت اشتراک‌ها

## نکات مهم

1. **Domain Detection**: Middleware `IdentifyMerchant` به صورت خودکار merchant را بر اساس domain/subdomain تشخیص می‌دهد
2. **Tenant Isolation**: Global Scope `MerchantScope` به صورت خودکار تمام queries را فیلتر می‌کند
3. **Theme Loading**: Theme Loader به صورت dynamic تم‌ها را لود می‌کند
4. **Landing Page**: وقتی merchant تشخیص داده نشود، landing page نمایش داده می‌شود



