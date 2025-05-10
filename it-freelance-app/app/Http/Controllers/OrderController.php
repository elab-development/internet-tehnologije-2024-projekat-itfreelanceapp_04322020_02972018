<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Gig;
use App\Http\Resources\OrderResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
     * Show a specific order that the buyer created.
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
     * Create a new order (only for buyers).
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        if ($user->user_type !== 'buyer') {
            return response()->json(['error' => 'Only buyers can create orders.'], 403);
        }

        $validated = $request->validate([
            'gig_id' => 'required|exists:gigs,id',
        ]);

        $gig = Gig::findOrFail($validated['gig_id']);

        if ($gig->user_id == $user->id) {
            return response()->json(['error' => 'You cannot order your own gig.'], 403);
        }

        $order = Order::create([
            'gig_id' => $gig->id,
            'buyer_id' => $user->id,
            'seller_id' => $gig->user_id,
            'status' => 'pending',
        ]);

        return new OrderResource($order);
    }

    /**
     * Update the status of an order (for both buyers and sellers).
     */
    public function updateStatus(Request $request, $id)
    {
        $user = Auth::user();
        $order = Order::findOrFail($id);

        // Check if user is a buyer updating their own order
        $isBuyer = $user->user_type === 'buyer' && $order->buyer_id === $user->id;
        
        // Check if user is a seller updating an order for their gig
        $isSeller = $user->user_type === 'seller' && $order->seller_id === $user->id;
        
        // Allow administrators to update any order
        $isAdmin = $user->user_type === 'administrator';
        
        if (!$isBuyer && !$isSeller && !$isAdmin) {
            return response()->json(['error' => 'Unauthorized to update this order.'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:pending,completed,cancelled',
        ]);

        // Additional validation for seller permissions
        if ($isSeller && !in_array($validated['status'], ['completed', 'cancelled'])) {
            return response()->json(['error' => 'Sellers can only mark orders as completed or cancelled.'], 403);
        }

        $order->update(['status' => $validated['status']]);

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

        $totalOrders = Order::count();
        $completedOrders = Order::where('status', 'completed')->count();
        $pendingOrders = Order::where('status', 'pending')->count();
        $cancelledOrders = Order::where('status', 'cancelled')->count();
        $totalRevenue = Order::where('status', 'completed')->with('gig')->get()->sum(fn ($order) => $order->gig->price);

        return response()->json([
            'total_orders' => $totalOrders,
            'completed_orders' => $completedOrders,
            'pending_orders' => $pendingOrders,
            'cancelled_orders' => $cancelledOrders,
            'total_revenue' => $totalRevenue
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
}
