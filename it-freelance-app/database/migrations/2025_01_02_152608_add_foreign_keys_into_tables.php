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

        Schema::table('gigs', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->after('revisions');
            $table->unsignedBigInteger('category_id')->after('user_id');

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');

            $table->foreign('category_id')
                ->references('id')
                ->on('categories')
                ->onDelete('cascade');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->unsignedBigInteger('gig_id')->after('status');
            $table->unsignedBigInteger('buyer_id')->after('gig_id');
            $table->unsignedBigInteger('seller_id')->after('buyer_id');

            $table->foreign('gig_id')
                ->references('id')
                ->on('gigs')
                ->onDelete('cascade');

            $table->foreign('buyer_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');

            $table->foreign('seller_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {

        Schema::table('gigs', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['category_id']);
            $table->dropColumn(['user_id', 'category_id']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['gig_id']);
            $table->dropForeign(['buyer_id']);
            $table->dropForeign(['seller_id']);
            $table->dropColumn(['gig_id', 'buyer_id', 'seller_id']);
        });
    }
};
