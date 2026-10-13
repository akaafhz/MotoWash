<?php

use Illuminate\Support\Facades\Route;

// Catch-all: serve Vue SPA for all non-API routes
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
