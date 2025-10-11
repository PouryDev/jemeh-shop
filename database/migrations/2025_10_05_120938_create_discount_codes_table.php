<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('discount_codes', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('type'); // 'percentage' or 'fixed'
            $table->unsignedInteger('value'); // percentage (1-100) or fixed amount in Toman
            $table->unsignedInteger('usage_limit')->nullable(); // null means unlimited
            $table->unsignedInteger('used_count')->default(0);
            $table->unsignedInteger('max_discount_amount')->nullable(); // maximum discount amount in Toman
            $table->unsignedInteger('min_order_amount')->nullable(); // minimum order amount to apply discount
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index(['code', 'is_active']);
            $table->index(['expires_at', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('discount_codes');
    }
};