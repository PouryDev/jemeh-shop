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
        // Add merchant_id to products
        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('merchant_id')->nullable()->after('id')->constrained()->onDelete('cascade');
            $table->index('merchant_id');
        });

        // Add merchant_id to categories
        Schema::table('categories', function (Blueprint $table) {
            $table->foreignId('merchant_id')->nullable()->after('id')->constrained()->onDelete('cascade');
            $table->index('merchant_id');
        });

        // Add merchant_id to orders
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('merchant_id')->nullable()->after('id')->constrained()->onDelete('cascade');
            $table->index('merchant_id');
        });

        // Add merchant_id to campaigns
        Schema::table('campaigns', function (Blueprint $table) {
            $table->foreignId('merchant_id')->nullable()->after('id')->constrained()->onDelete('cascade');
            $table->index('merchant_id');
        });

        // Add merchant_id to discount_codes
        Schema::table('discount_codes', function (Blueprint $table) {
            $table->foreignId('merchant_id')->nullable()->after('id')->constrained()->onDelete('cascade');
            $table->index('merchant_id');
        });

        // Add merchant_id to hero_slides
        Schema::table('hero_slides', function (Blueprint $table) {
            $table->foreignId('merchant_id')->nullable()->after('id')->constrained()->onDelete('cascade');
            $table->index('merchant_id');
        });

        // Add merchant_id to delivery_methods
        Schema::table('delivery_methods', function (Blueprint $table) {
            $table->foreignId('merchant_id')->nullable()->after('id')->constrained()->onDelete('cascade');
            $table->index('merchant_id');
        });

        // Add merchant_id to payment_gateways
        Schema::table('payment_gateways', function (Blueprint $table) {
            $table->foreignId('merchant_id')->nullable()->after('id')->constrained()->onDelete('cascade');
            $table->index('merchant_id');
        });

        // Add merchant_id to addresses
        Schema::table('addresses', function (Blueprint $table) {
            $table->foreignId('merchant_id')->nullable()->after('id')->constrained()->onDelete('cascade');
            $table->index('merchant_id');
        });

        // Add merchant_id to transactions
        Schema::table('transactions', function (Blueprint $table) {
            $table->foreignId('merchant_id')->nullable()->after('id')->constrained()->onDelete('cascade');
            $table->index('merchant_id');
        });

        // Add merchant_id to invoices
        Schema::table('invoices', function (Blueprint $table) {
            $table->foreignId('merchant_id')->nullable()->after('id')->constrained()->onDelete('cascade');
            $table->index('merchant_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['merchant_id']);
            $table->dropColumn('merchant_id');
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropForeign(['merchant_id']);
            $table->dropColumn('merchant_id');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['merchant_id']);
            $table->dropColumn('merchant_id');
        });

        Schema::table('campaigns', function (Blueprint $table) {
            $table->dropForeign(['merchant_id']);
            $table->dropColumn('merchant_id');
        });

        Schema::table('discount_codes', function (Blueprint $table) {
            $table->dropForeign(['merchant_id']);
            $table->dropColumn('merchant_id');
        });

        Schema::table('hero_slides', function (Blueprint $table) {
            $table->dropForeign(['merchant_id']);
            $table->dropColumn('merchant_id');
        });

        Schema::table('delivery_methods', function (Blueprint $table) {
            $table->dropForeign(['merchant_id']);
            $table->dropColumn('merchant_id');
        });

        Schema::table('payment_gateways', function (Blueprint $table) {
            $table->dropForeign(['merchant_id']);
            $table->dropColumn('merchant_id');
        });

        Schema::table('addresses', function (Blueprint $table) {
            $table->dropForeign(['merchant_id']);
            $table->dropColumn('merchant_id');
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->dropForeign(['merchant_id']);
            $table->dropColumn('merchant_id');
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->dropForeign(['merchant_id']);
            $table->dropColumn('merchant_id');
        });
    }
};