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
            ->orderBy('scheduled_time')
            ->orderBy('created_at')
            ->get();

        return response()->json($bookings);
    }

    public function callNext()
    {
        $next = Booking::where('status', 'menunggu')
            ->whereDate('created_at', today())
            ->orderBy('scheduled_time')
            ->orderBy('created_at')
            ->first();

        if (! $next) {
            return response()->json(['message' => 'Tidak ada antrean menunggu'], 404);
        }

        return response()->json([
            'called' => $next->queue_number,
            'booking' => $next,
        ]);
    }

    public function skip(Request $request, Booking $booking)
    {
        abort_unless($booking->status === 'menunggu', 422, 'Antrean ini tidak dapat dilewati.');

        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $booking->update([
            'status' => 'dilewati',
            'skip_reason' => $validated['reason'],
        ]);

        return response()->json($booking);
    }

    public function stats()
    {
        $today = Booking::whereDate('created_at', today());

        $pendapatan = (clone $today)->where('status', 'selesai')->get()
            ->sum(fn (Booking $booking) => $booking->service_price);

        return response()->json([
            'total' => (clone $today)->count(),
            'menunggu' => (clone $today)->where('status', 'menunggu')->count(),
            'proses' => (clone $today)->where('status', 'proses')->count(),
            'selesai' => (clone $today)->where('status', 'selesai')->count(),
            'pendapatan' => $pendapatan,
        ]);
    }
}
