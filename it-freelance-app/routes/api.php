<?php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GigController;
use App\Http\Controllers\OrderController;

Route::post('/register', [AuthController::class, 'register']); 
Route::post('/login', [AuthController::class, 'login']); 

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/gigs', [GigController::class, 'index']);
    Route::get('/gigs/{id}', [GigController::class, 'show']);
    Route::post('/gigs', [GigController::class, 'store']);
    Route::put('/gigs/{id}', [GigController::class, 'update']);
    Route::patch('/gigs/{id}/rating', [GigController::class, 'updateRatingFeedback']);
    Route::delete('/gigs/{id}', [GigController::class, 'destroy']);
    
    // Route for sellers to view only their own gigs
    Route::get('/my-gigs', [GigController::class, 'myGigs']);

    // Route for sellers to view orders for their gigs
    Route::get('/seller-orders', [OrderController::class, 'sellerOrders']);

    Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus']);

    Route::resource('orders', OrderController::class)->only([
        'index', 'show', 'store'
    ]);

    Route::get('/admin/orders/export', [OrderController::class, 'exportOrdersToExcel']);
    Route::get('/admin/orders/metrics', [OrderController::class, 'calculateOrderMetrics']);

    Route::post('/logout', [AuthController::class, 'logout']);
});