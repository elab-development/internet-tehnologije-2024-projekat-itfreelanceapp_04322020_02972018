<?php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GigController;

Route::post('/register', [AuthController::class, 'register']); 
Route::post('/login', [AuthController::class, 'login']); 

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/gigs', [GigController::class, 'index']);
    Route::get('/gigs/{id}', [GigController::class, 'show']);
    Route::post('/gigs', [GigController::class, 'store']);
    Route::put('/gigs/{id}', [GigController::class, 'update']);
    Route::patch('/gigs/{id}/rating', [GigController::class, 'updateRatingFeedback']);
    Route::delete('/gigs/{id}', [GigController::class, 'destroy']);

    Route::post('/logout', [AuthController::class, 'logout']);
});