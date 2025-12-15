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
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Basic, Professional, Enterprise
            $table->string('slug')->unique(); // basic, professional, enterprise
            $table->text('description')->nullable();
            $table->unsignedInteger('price_monthly')->default(0); // قیمت ماهانه به تومان
            $table->unsignedInteger('price_yearly')->default(0); // قیمت سالانه به تومان
            $table->json('features')->nullable(); // product_variants, campaigns, analytics, telegram_notifications, custom_domain, custom_templates
            $table->json('limits')->nullable(); // max_products, max_slides, max_delivery_methods, commission_rate
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
