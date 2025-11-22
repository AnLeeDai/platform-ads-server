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
        Schema::create('storages', function (Blueprint $table) {
            $table->uuid('id')->primary()->index();
            $table->char('name')->unique()->index();
            $table->text('description')->nullable();
            $table->date('expired_date')->nullable();
            $table->enum('item_type', ['CASH', 'COUPON', 'POINT'])->default('POINT');
            $table->bigInteger('quantity')->nullable()->default(0);
            $table->float('interest_rate')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('storages');
    }
};
