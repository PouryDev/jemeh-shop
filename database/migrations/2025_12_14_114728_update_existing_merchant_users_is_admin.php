<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update existing records: if role is 'admin', set is_admin to true
        DB::table('merchant_users')
            ->where('role', 'admin')
            ->update(['is_admin' => true]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert: set is_admin to false for all records
        DB::table('merchant_users')
            ->update(['is_admin' => false]);
    }
};
