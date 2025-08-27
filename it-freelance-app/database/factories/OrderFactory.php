<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\Gig;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order>
 */
class OrderFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
   protected $model = Order::class;

    public function definition(): array
    {
        // Try to relate to an existing gig (often provided by seeder)
        $gig = Gig::inRandomOrder()->first();

        // Find a buyer user; ensure not the gig owner
        $buyer = User::where('user_type', 'buyer')->inRandomOrder()->first();

        // Fallback base price if no gig is available yet
        $basePrice = $gig ? (float) $gig->price : 100;

        // Bid: random +5%..+50% on base
        $multiplier = $this->faker->randomFloat(2, 1.05, 1.5);
        $bid = round($basePrice * $multiplier, 2);

        // Status: default pending (licitations)
        $status = $this->faker->randomElement(['pending', 'pending', 'pending', 'cancelled']);

        return [
            'status'     => $status,
            'price'      => $bid,
            'gig_id'     => $gig?->id,
            'buyer_id'   => $buyer?->id,
            'seller_id'  => $gig?->user_id,
            'is_winner'  => false,
            'locked_at'  => null,
        ];
    }
}
