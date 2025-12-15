<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('merchants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // owner
            $table->string('name'); // نام فروشگاه
            $table->string('slug')->unique(); // slug یکتا برای subdomain
            $table->string('domain')->nullable()->unique(); // دامنه سفارشی
            $table->string('subdomain')->nullable()->unique(); // subdomain (برای Basic plan)
            $table->foreignId('theme_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('plan_id')->constrained()->onDelete('restrict');
            $table->enum('subscription_status', ['active', 'trial', 'expired', 'canceled'])->default('trial');
            $table->string('telegram_chat_id')->nullable(); // برای اعلان‌های سفارش
            $table->json('settings')->nullable(); // تنظیمات اضافی merchant
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index('slug');
            $table->index('domain');
            $table->index('subdomain');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('merchants');
    }
};
