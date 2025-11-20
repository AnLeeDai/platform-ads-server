<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Change the sessions.user_id column to a varchar so UUIDs are accepted.
        DB::statement("ALTER TABLE `sessions` MODIFY `user_id` VARCHAR(36) NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert to a big integer (unsigned) which was previously used by foreignId().
        DB::statement("ALTER TABLE `sessions` MODIFY `user_id` BIGINT UNSIGNED NULL");
    }
};
