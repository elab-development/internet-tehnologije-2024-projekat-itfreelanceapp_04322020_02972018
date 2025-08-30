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
            'id'        => $this->id,
            'status'    => $this->status,
            'price'     => (float) $this->price,

            // expose both gig_id and the nested gig with its id
            'gig_id'    => $this->gig_id,
            'gig'       => [
                'id'        => $this->gig->id,
                'title'     => $this->gig->title,
                'price'     => (float) $this->gig->price,
                'rating'    => $this->gig->rating,
                'feedback'  => $this->gig->feedback,
            ],

            'buyer'     => [
                'id'    => $this->buyer->id,
                'name'  => $this->buyer->name,
            ],
            'seller'    => [
                'id'    => $this->seller->id,
                'name'  => $this->seller->name,
            ],

            // optional but handy for the UI
            'created_at' => optional($this->created_at)->toISOString(),
        ];
    }
}
