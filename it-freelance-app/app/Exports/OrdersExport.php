<?php

namespace App\Exports;

use App\Models\Order;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class OrdersExport implements FromCollection, WithHeadings
{
    /**
     * Return all orders as a collection.
     */
    public function collection()
    {
        return Order::with('gig', 'buyer', 'seller')
            ->get()
            ->map(function ($order) {
                return [
                    'Order ID' => $order->id,
                    'Gig Title' => $order->gig->title,
                    'Buyer Name' => $order->buyer->name,
                    'Seller Name' => $order->seller->name,
                    'Status' => $order->status,
                    'Price' => $order->gig->price,
                ];
            });
    }

    /**
     * Define column headings for the Excel file.
     */
    public function headings(): array
    {
        return [
            'Order ID',
            'Gig Title',
            'Buyer Name',
            'Seller Name',
            'Status',
            'Price'
        ];
    }
}
