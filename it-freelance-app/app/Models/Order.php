<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    // If your table uses created_at/updated_at, set this to true.
    // Keeping your original setting as false:
    public $timestamps = false;

    protected $fillable = [
        'status',
        'price',        // per-order bid amount
        'gig_id',
        'buyer_id',
        'seller_id',
        'is_winner',    // flag when seller locks the winning bid
        'locked_at',    // when the seller locked this price (nullable)
    ];

    protected $casts = [
        'price'     => 'float',
        'is_winner' => 'boolean',
        'locked_at' => 'datetime',
    ];

    public function gig()
    {
        return $this->belongsTo(Gig::class);
    }

    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }
}
