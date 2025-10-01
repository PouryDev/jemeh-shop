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
        Schema::table('users', function (Blueprint $table) {
            // Add Instagram ID (unique identifier for login)
            $table->string('instagram_id')->unique()->after('name');
            
            // Make phone unique and required (will be used for login)
            $table->string('phone')->unique()->change();
            
            // Make email nullable (we don't need it anymore)
            $table->string('email')->nullable()->change();
            
            // Drop email unique index
            $table->dropUnique(['email']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Reverse the changes
            $table->dropColumn('instagram_id');
            $table->string('phone')->nullable()->change();
            $table->string('email')->nullable(false)->change();
            $table->unique('email');
        });
    }
};
