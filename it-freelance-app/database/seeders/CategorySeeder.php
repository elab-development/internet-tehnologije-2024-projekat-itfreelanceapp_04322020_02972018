<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Web Development (frontend, backend, full-stack)',
            'Mobile Application Development',
            'Software Development',
            'Data Science and Analytics',
            'Artificial Intelligence and Machine Learning',
            'UI/UX Prototyping',
            'WordPress Development',
            'Cyber Security',
        ];

        foreach ($categories as $category) {
            DB::table('categories')->insert([
                'name' => $category,
                'description' => fake()->sentence(10), 
            ]);
        }
    }
}
