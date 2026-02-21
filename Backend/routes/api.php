<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PredictionController;
use App\Http\Controllers\AuthController;

// Routes Publiques (Pas besoin d'être connecté)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Routes Protégées (Il FAUT être connecté avec un Token)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/predict', [PredictionController::class, 'store']);
    Route::get('/history', [PredictionController::class, 'index']);
});
