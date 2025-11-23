<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ads', function (Blueprint $table) {
            $table->uuid('id')->primary()->index();
            $table->char('title')->index();
            $table->string('description');
            $table->integer('duration');
            $table->string('poster_url');
            $table->string('video_url');
            $table->boolean('is_active')->default(true);
            $table->tinyInteger('point_reward');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ads');
    }
};
