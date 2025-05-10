<?php

namespace Database\Factories;

use App\Models\Gig;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Gig>
 */
class GigFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Gig::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {

        $category = Category::inRandomOrder()->first();

        $titles = [
            'Web Development (frontend, backend, full-stack)' => [
                'Build a Full-Stack Web Application',
                'Develop a Responsive Frontend Website',
                'Create a Custom Backend API',
            ],
            'Mobile Application Development' => [
                'Develop an Android App',
                'Create a Cross-Platform Mobile App',
                'Build an iOS Application',
            ],
            'Software Development' => [
                'Design and Develop Custom Software',
                'Create a Desktop Application',
                'Develop an Enterprise Software Solution',
            ],
            'Data Science and Analytics' => [
                'Perform Data Cleaning and Analysis',
                'Build Predictive Models',
                'Visualize Data Insights',
            ],
            'Artificial Intelligence and Machine Learning' => [
                'Train a Machine Learning Model',
                'Develop a Chatbot with AI',
                'Build a Recommendation System',
            ],
            'UI/UX Prototyping' => [
                'Create a Wireframe for a Website',
                'Design a Mobile App Prototype',
                'Conduct Usability Testing for UX Design',
            ],
            'WordPress Development' => [
                'Build a Custom WordPress Theme',
                'Develop a WordPress Plugin',
                'Set Up an eCommerce WordPress Website',
            ],
            'Cyber Security' => [
                'Perform a Security Audit',
                'Set Up a Firewall for Your Network',
                'Conduct Penetration Testing',
            ],
        ];

        $title = $this->faker->randomElement($titles[$category->name]);

        $user = User::where('user_type', '!=', 'administrator')->inRandomOrder()->first();

        return [
            'title' => $title,
            'description' => $this->faker->paragraph(),
            'price' => $this->faker->randomFloat(2, 50, 500), 
            'delivery_time' => $this->faker->numberBetween(1, 30), 
            'user_id' => $user->id, 
            'category_id' => $category->id, 
            'rating' => $this->faker->numberBetween(3, 5),
            'feedback' => $this->faker->sentence(10), 
        ];
    }
}
