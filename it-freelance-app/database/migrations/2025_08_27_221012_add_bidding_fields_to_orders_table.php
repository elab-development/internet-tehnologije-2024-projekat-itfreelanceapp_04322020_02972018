<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Per-order bid value (nullable so existing rows remain valid)
            if (!Schema::hasColumn('orders', 'price')) {
                $table->decimal('price', 10, 2)->nullable()->after('status');
            }

            // Mark the winning/locked order for a gig
            if (!Schema::hasColumn('orders', 'is_winner')) {
                $table->boolean('is_winner')->default(false)->after('seller_id');
            }

            // When the seller “locks” a price (sets the winning order)
            if (!Schema::hasColumn('orders', 'locked_at')) {
                $table->timestamp('locked_at')->nullable()->after('is_winner');
            }

            // Helpful index for finding top bids on a gig
            if (!Schema::hasColumn('orders', 'price')) {
                // if price was newly added we can safely index it
                $table->index(['gig_id', 'price']);
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'locked_at')) {
                $table->dropColumn('locked_at');
            }
            if (Schema::hasColumn('orders', 'is_winner')) {
                $table->dropColumn('is_winner');
            }
        });
    }
};
