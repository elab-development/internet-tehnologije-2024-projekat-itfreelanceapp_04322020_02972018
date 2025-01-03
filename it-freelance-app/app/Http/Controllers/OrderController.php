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
     * Display a list of the buyer's orders.
     */
    public function index()
    {
        $user = Auth::user();

        if ($user->user_type === 'administrator') {
            return OrderResource::collection(Order::all());
        }

        if ($user->user_type !== 'buyer') {
            return response()->json(['error' => 'Only buyers can view orders.'], 403);
        }

        $orders = $user->ordersAsBuyer;
        return OrderResource::collection($orders);
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
     * Update the status of an order (only for the buyer who created it).
     */
    public function updateStatus(Request $request, $id)
    {
        $user = Auth::user();
        $order = Order::findOrFail($id);

        if ($user->user_type !== 'buyer' || $order->buyer_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized to update this order.'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:pending,completed,cancelled',
        ]);

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
}
