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
            $table->dropColumn(['email_verified_at', 'created_at', 'updated_at']);

            $table->enum('user_type', ['buyer', 'seller', 'administrator'])->after('password'); 
            $table->string('github_link')->nullable()->after('user_type'); 
            $table->string('phone')->nullable()->after('github_link'); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('email_verified_at')->nullable()->after('email');
            $table->timestamps();

            $table->dropColumn(['user_type', 'github_link', 'phone']);
        });
    }
};
