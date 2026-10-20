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
            'bike_model' => 'required|string|max:255',
            'plat_nomor' => 'required|string|max:20',
            'scheduled_time' => ['required', 'string', 'in:08:00,08:30,09:00,09:30,10:00,10:30,11:00,11:30,12:00,13:00,13:30,14:00,14:30,15:00,15:30,16:00,16:30,17:00'],
            'location' => ['required', 'string', 'in:Parkir Depan Kantin,Parkir Basement B1,Parkir Basement B2,Parkir Timur Lt. 1,Parkir Timur Lt. 2,Parkir Selatan,Parkir Utara (Dekat Lobby)'],
            'service_type' => 'required|in:Cuci Motor,Service Motor',
            'notes' => 'nullable|string|max:500',
        ]);

        $slotTaken = Booking::query()
            ->where('location', $validated['location'])
            ->where('scheduled_time', $validated['scheduled_time'])
            ->where('service_type', $validated['service_type'])
            ->whereIn('status', ['menunggu', 'proses'])
            ->exists();

        if ($slotTaken) {
            return response()->json([
                'message' => 'Slot pada lokasi dan jam tersebut sudah penuh.',
            ], 422);
        }

        if ($validated['service_type'] === 'Service Motor' && blank($validated['notes'] ?? null)) {
            return response()->json([
                'message' => 'Jelaskan kerusakan atau keluhan motor pada catatan service.',
            ], 422);
        }

        $lastBooking = Booking::whereDate('created_at', today())
            ->where('service_type', $validated['service_type'])
            ->latest()
            ->first();
        $queueNum = $lastBooking
            ? intval(substr($lastBooking->queue_number, 2)) + 1
            : 1;

        $booking = Booking::create([
            ...$validated,
            'user_id' => $request->user()->id,
            'queue_number' => ($validated['service_type'] === 'Service Motor' ? 'S-' : 'C-').str_pad($queueNum, 2, '0', STR_PAD_LEFT),
            'status' => 'menunggu',
        ]);

        return response()->json($booking->load('user'), 201);
    }

    public function show(Request $request, Booking $booking)
    {
        $this->authorizeBookingAccess($request, $booking);

        return response()->json($booking->load('user'));
    }

    public function update(Request $request, Booking $booking)
    {
        $this->authorizeBookingAccess($request, $booking);

        $validated = $request->validate([
            'scheduled_time' => ['sometimes', 'required', 'string', 'in:08:00,08:30,09:00,09:30,10:00,10:30,11:00,11:30,12:00,13:00,13:30,14:00,14:30,15:00,15:30,16:00,16:30,17:00'],
            'location' => ['sometimes', 'required', 'string', 'in:Parkir Depan Kantin,Parkir Basement B1,Parkir Basement B2,Parkir Timur Lt. 1,Parkir Timur Lt. 2,Parkir Selatan,Parkir Utara (Dekat Lobby)'],
            'service_type' => ['sometimes', 'required', 'in:Cuci Motor,Service Motor'],
            'notes' => 'sometimes|nullable|string|max:500',
        ]);

        $location = $validated['location'] ?? $booking->location;
        $scheduledTime = $validated['scheduled_time'] ?? $booking->scheduled_time;
        $serviceType = $validated['service_type'] ?? $booking->service_type;
        $slotTaken = Booking::query()
            ->where('id', '!=', $booking->id)
            ->where('location', $location)
            ->where('scheduled_time', $scheduledTime)
            ->where('service_type', $serviceType)
            ->whereIn('status', ['menunggu', 'proses'])
            ->exists();

        if ($slotTaken) {
            return response()->json([
                'message' => 'Slot pada lokasi dan jam tersebut sudah penuh.',
            ], 422);
        }

        $booking->update($validated);

        return response()->json($booking);
    }

    public function destroy(Request $request, Booking $booking)
    {
        $this->authorizeBookingAccess($request, $booking);

        $booking->delete();

        return response()->json(null, 204);
    }

    public function startWash(Request $request, Booking $booking)
    {
        $booking->update([
            'status' => 'proses',
            'washer_name' => $request->user()->name,
            'started_at' => now(),
        ]);

        return response()->json($booking);
    }

    public function finishWash(Booking $booking)
    {
        $booking->update([
            'status' => 'selesai',
            'finished_at' => now(),
        ]);

        return response()->json($booking);
    }

    private function authorizeBookingAccess(Request $request, Booking $booking): void
    {
        abort_unless(
            $request->user()->role !== 'customer' || $booking->user_id === $request->user()->id,
            403,
            'Anda tidak memiliki akses ke booking ini.'
        );
    }
}
