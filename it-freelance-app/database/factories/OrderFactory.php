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

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {

        $gig = Gig::inRandomOrder()->first();
        $seller = $gig->user;

        $buyer = User::where('id', '!=', $seller->id)
            ->where('user_type', '!=', 'administrator')
            ->inRandomOrder()
            ->first();

        return [
            'status' => $this->faker->randomElement(['pending', 'completed', 'cancelled']),
            'gig_id' => $gig->id,
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
        ];
    }
}
