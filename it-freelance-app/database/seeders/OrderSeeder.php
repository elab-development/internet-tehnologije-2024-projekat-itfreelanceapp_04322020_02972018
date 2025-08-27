<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\Gig;
use App\Models\User;

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

        $buyers = User::where('user_type', 'buyer')->get();
        if ($buyers->isEmpty()) {
            $this->command->info('Please seed some buyers (users with user_type=buyer) first.');
            return;
        }

        $gigs->each(function ($gig) use ($buyers) {
            // Create 2–5 bids for this gig
            $numBids = rand(2, 5);

            // Random unique buyers for this gig’s licitation
            $selectedBuyers = $buyers->random(min($numBids, $buyers->count()))->values();

            $base = (float) $gig->price;

            $bids = [];
            foreach ($selectedBuyers as $buyer) {
                // Make sure each bid is at least base price and then +0%..+50%
                $multiplier = rand(100, 150) / 100; // 1.00 .. 1.50
                $bidAmount = round($base * $multiplier, 2);

                $bids[] = Order::create([
                    'status'     => 'pending',      // all pending at seed time
                    'price'      => $bidAmount,     // per-order bid
                    'gig_id'     => $gig->id,
                    'buyer_id'   => $buyer->id,
                    'seller_id'  => $gig->user_id,
                    'is_winner'  => false,
                    'locked_at'  => null,
                ]);
            }

            if (!empty($bids)) {
                $leader = collect($bids)->sortByDesc('price')->first();
            }
        });
    }
}
