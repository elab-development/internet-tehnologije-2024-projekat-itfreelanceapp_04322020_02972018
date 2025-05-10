<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'gig' => [
                'title' => $this->gig->title,
                'price' => $this->gig->price
            ],
            'buyer' => [
                'id' => $this->buyer->id,
                'name' => $this->buyer->name
            ],
            'seller' => [
                'id' => $this->seller->id,
                'name' => $this->seller->name
            ]
        ];
    }
}
