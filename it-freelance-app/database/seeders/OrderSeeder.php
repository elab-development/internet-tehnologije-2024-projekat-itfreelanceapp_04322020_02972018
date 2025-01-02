<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\Gig;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $gigs = Gig::all();

        if ($gigs->isEmpty()) {
            $this->command->info('Please seed Gigs first.');
            return;
        }

        $gigs->each(function ($gig) {
            Order::factory(rand(1, 3))->create([
                'gig_id' => $gig->id,
                'seller_id' => $gig->user_id,
            ]);
        });
    }
}
