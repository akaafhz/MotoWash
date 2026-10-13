<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $query = Booking::with('user')->latest();

        if ($request->user()->role === 'customer') {
            $query->where('user_id', $request->user()->id);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'bike_model'     => 'required|string|max:255',
            'plat_nomor'     => 'required|string|max:20',
            'scheduled_time' => 'required|string',
            'location'       => 'required|string|max:255',
            'service_type'   => 'required|in:Standard,Express,Premium',
            'notes'          => 'nullable|string|max:500',
        ]);

        $lastBooking = Booking::whereDate('created_at', today())->latest()->first();
        $queueNum    = $lastBooking
            ? intval(substr($lastBooking->queue_number, 2)) + 1
            : 1;

        $booking = Booking::create([
            ...$validated,
            'user_id'      => $request->user()->id,
            'queue_number' => 'A-' . str_pad($queueNum, 2, '0', STR_PAD_LEFT),
            'status'       => 'menunggu',
        ]);

        return response()->json($booking->load('user'), 201);
    }

    public function show(Booking $booking)
    {
        return response()->json($booking->load('user'));
    }

    public function update(Request $request, Booking $booking)
    {
        $booking->update($request->only(['notes', 'scheduled_time', 'location']));
        return response()->json($booking);
    }

    public function destroy(Booking $booking)
    {
        $booking->delete();
        return response()->json(null, 204);
    }

    public function startWash(Request $request, Booking $booking)
    {
        $booking->update([
            'status'       => 'proses',
            'washer_name'  => $request->user()->name,
            'started_at'   => now(),
        ]);
        return response()->json($booking);
    }

    public function finishWash(Booking $booking)
    {
        $booking->update([
            'status'      => 'selesai',
            'finished_at' => now(),
        ]);
        return response()->json($booking);
    }
}
