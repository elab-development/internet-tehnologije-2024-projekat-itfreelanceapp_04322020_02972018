<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@support.com',
            'password' => bcrypt('supportGodMode123'),
            'user_type' => 'administrator',
            'github_link' => '',
            'phone' => '',
        ]);

        User::factory(20)->create(); 
    }
}
