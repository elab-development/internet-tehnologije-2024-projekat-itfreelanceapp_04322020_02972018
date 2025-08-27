<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Gig;
use App\Http\Resources\OrderResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\OrdersExport;

class OrderController extends Controller
{
    /**
     * Display a list of orders (buyers see their orders, sellers see orders for their gigs).
     */
    public function index()
    {
        $user = Auth::user();

        if ($user->user_type === 'administrator') {
            return OrderResource::collection(Order::all());
        }

        if ($user->user_type === 'buyer') {
            $orders = $user->ordersAsBuyer;
            return OrderResource::collection($orders);
        }

        if ($user->user_type === 'seller') {
            $orders = Order::where('seller_id', $user->id)->get();
            return OrderResource::collection($orders);
        }

        return response()->json(['error' => 'Unauthorized to view orders.'], 403);
    }

    /**
     * Show a specific order that the buyer created (or admin).
     */
    public function show($id)
    {
        $user = Auth::user();
        $order = Order::findOrFail($id);

        if ($user->user_type === 'administrator') {
            return new OrderResource($order);
        }

        if ($user->user_type !== 'buyer' || $order->buyer_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized to view this order.'], 403);
        }

        return new OrderResource($order);
    }

    /**
     * Place a bid (create an order). Only buyers can bid.
     * Requires: gig_id, price
     * Validates price >= max(gig base price, current highest bid for that gig).
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        if ($user->user_type !== 'buyer') {
            return response()->json(['error' => 'Only buyers can create orders.'], 403);
        }

        $validated = $request->validate([
            'gig_id' => 'required|exists:gigs,id',
            'price'  => 'required|numeric|min:0',
        ]);

        $gig = Gig::findOrFail($validated['gig_id']);

        if ((int)$gig->user_id === (int)$user->id) {
            return response()->json(['error' => 'You cannot order your own gig.'], 403);
        }

        // If the gig already has a completed order, bidding is locked.
        $locked = Order::where('gig_id', $gig->id)->where('status', 'completed')->exists();
        if ($locked) {
            return response()->json(['error' => 'Bidding for this gig is locked.'], 409);
        }

        $currentHighest = (float) Order::where('gig_id', $gig->id)->max('price');
        $basePrice      = (float) $gig->price;
        $minAllowed     = max($basePrice, $currentHighest);

        if ((float)$validated['price'] < $minAllowed) {
            return response()->json([
                'error' => "Your bid must be at least {$minAllowed}."
            ], 422);
        }

        $order = Order::create([
            'gig_id'   => $gig->id,
            'buyer_id' => $user->id,
            'seller_id'=> $gig->user_id,
            'status'   => 'pending',
            'price'    => (float)$validated['price'],
        ]);

        return new OrderResource($order);
    }

    /**
     * Update the status of an order.
     * Sellers can mark orders as completed/cancelled.
     * When marking as 'completed', all other orders for the same gig are auto-cancelled (locks bidding).
     */
    public function updateStatus(Request $request, $id)
    {
        $user  = Auth::user();
        $order = Order::findOrFail($id);

        $isBuyer = $user->user_type === 'buyer' && $order->buyer_id === $user->id;
        $isSeller = $user->user_type === 'seller' && $order->seller_id === $user->id;
        $isAdmin = $user->user_type === 'administrator';
        
        if (!$isBuyer && !$isSeller && !$isAdmin) {
            return response()->json(['error' => 'Unauthorized to update this order.'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:pending,completed,cancelled',
        ]);

        if ($isSeller && !in_array($validated['status'], ['completed', 'cancelled'])) {
            return response()->json(['error' => 'Sellers can only mark orders as completed or cancelled.'], 403);
        }

        // If the gig already has a completed order and the current update is not that one, prevent changes
        if ($validated['status'] === 'completed') {
            // Complete this order and cancel the rest for the same gig (atomic)
            DB::transaction(function () use ($order) {
                // mark this order as completed
                $order->update(['status' => 'completed']);

                // cancel all other orders of same gig
                Order::where('gig_id', $order->gig_id)
                    ->where('id', '!=', $order->id)
                    ->update(['status' => 'cancelled']);
            });
        } else {
            $order->update(['status' => $validated['status']]);
        }

        return new OrderResource($order);
    }

    /**
     * Export all orders to an Excel file (only for administrators).
     */
    public function exportOrdersToExcel()
    {
        $user = Auth::user();

        if ($user->user_type !== 'administrator') {
            return response()->json(['error' => 'Only administrators can export orders.'], 403);
        }

        return Excel::download(new OrdersExport, 'orders.xlsx');
    }

    /**
     * Calculate order metrics (only for administrators).
     */
    public function calculateOrderMetrics()
    {
        $user = Auth::user();

        if ($user->user_type !== 'administrator') {
            return response()->json(['error' => 'Only administrators can view metrics.'], 403);
        }

        $totalOrders     = Order::count();
        $completedOrders = Order::where('status', 'completed')->count();
        $pendingOrders   = Order::where('status', 'pending')->count();
        $cancelledOrders = Order::where('status', 'cancelled')->count();
        $totalRevenue    = Order::where('status', 'completed')->sum('price');

        return response()->json([
            'total_orders'       => $totalOrders,
            'completed_orders'   => $completedOrders,
            'pending_orders'     => $pendingOrders,
            'cancelled_orders'   => $cancelledOrders,
            'total_revenue'      => (float) $totalRevenue,
        ]);
    }

    /**
     * Display a list of orders for gigs created by the authenticated seller.
     */
    public function sellerOrders()
    {
        $user = Auth::user();

        if ($user->user_type !== 'seller') {
            return response()->json(['error' => 'Only sellers can access this resource'], 403);
        }

        $orders = Order::where('seller_id', $user->id)->get();
        return OrderResource::collection($orders);
    }

    /**
     * Bids summary for a gig (used by the GigDetails UI).
     * Returns: highest_bid, leader_name, is_locked, winner_name, winner_price
     */
    public function bidsSummary($gigId)
    {
        $gig = Gig::findOrFail($gigId);

        $highest = Order::where('gig_id', $gig->id)
            ->orderByDesc('price')
            ->with('buyer:id,name')
            ->first();

        $winner = Order::where('gig_id', $gig->id)
            ->where('status', 'completed')
            ->orderByDesc('price')
            ->with('buyer:id,name')
            ->first();

        return response()->json([
            'highest_bid' => $highest ? (float) $highest->price : null,
            'leader_name' => $highest ? $highest->buyer->name : null,
            'is_locked'   => (bool) $winner,
            'winner_name' => $winner ? $winner->buyer->name : null,
            'winner_price'=> $winner ? (float) $winner->price : null,
        ]);
    }

    /**
     * Flexible fallback endpoint to fetch highest bid:
     * - GET /api/orders/highest?gig_id=123
     * - GET /api/orders/highest/123
     */
    public function highest(Request $request, $gigId = null)
    {
        $gid = $gigId ?? $request->query('gig_id');
        if (!$gid) {
            return response()->json(['error' => 'gig_id is required'], 422);
        }

        $gig = Gig::findOrFail($gid);

        $highest = Order::where('gig_id', $gig->id)
            ->orderByDesc('price')
            ->with('buyer:id,name')
            ->first();

        $winner = Order::where('gig_id', $gig->id)
            ->where('status', 'completed')
            ->orderByDesc('price')
            ->with('buyer:id,name')
            ->first();

        return response()->json([
            'highest_bid' => $highest ? (float) $highest->price : null,
            'leader_name' => $highest ? $highest->buyer->name : null,
            'is_locked'   => (bool) $winner,
            'winner_name' => $winner ? $winner->buyer->name : null,
            'winner_price'=> $winner ? (float) $winner->price : null,
        ]);
    }
}
