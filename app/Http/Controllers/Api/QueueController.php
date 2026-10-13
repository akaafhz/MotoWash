<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;

class QueueController extends Controller
{
    public function live()
    {
        $bookings = Booking::with('user')
            ->whereDate('created_at', today())
            ->orderBy('queue_number')
            ->get();

        return response()->json($bookings);
    }

    public function callNext()
    {
        $next = Booking::where('status', 'menunggu')
            ->whereDate('created_at', today())
            ->orderBy('queue_number')
            ->first();

        if (! $next) {
            return response()->json(['message' => 'Tidak ada antrean menunggu'], 404);
        }

        return response()->json([
            'called' => $next->queue_number,
            'booking' => $next,
        ]);
    }

    public function stats()
    {
        $today = Booking::whereDate('created_at', today());

        $prices = ['Standard' => 15000, 'Express' => 20000, 'Premium' => 25000];

        $pendapatan = (clone $today)->where('status', 'selesai')->get()
            ->sum(fn ($b) => $prices[$b->service_type] ?? 0);

        return response()->json([
            'total'      => (clone $today)->count(),
            'menunggu'   => (clone $today)->where('status', 'menunggu')->count(),
            'proses'     => (clone $today)->where('status', 'proses')->count(),
            'selesai'    => (clone $today)->where('status', 'selesai')->count(),
            'pendapatan' => $pendapatan,
        ]);
    }
}
