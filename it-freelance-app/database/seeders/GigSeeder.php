<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Gig;


class GigSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
            Gig::factory(15)->create();
    }
}
