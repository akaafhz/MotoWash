<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create demo users
        $customer = User::firstOrCreate(
            ['email' => 'customer@motowash.id'],
            ['name' => 'Budi Santoso', 'password' => Hash::make('password'), 'role' => 'customer']
        );

        $washer = User::firstOrCreate(
            ['email' => 'washer@motowash.id'],
            ['name' => 'Agus Washer', 'password' => Hash::make('password'), 'role' => 'washer']
        );

        User::firstOrCreate(
            ['email' => 'admin@motowash.id'],
            ['name' => 'Admin Lapak', 'password' => Hash::make('password'), 'role' => 'admin']
        );

        // Create sample bookings
        $bookings = [
            [
                'user_id' => $customer->id,
                'queue_number' => 'A-01',
                'bike_model' => 'Honda Vario 125',
                'plat_nomor' => 'B 1234 XY',
                'location' => 'Parkir Depan Kantin',
                'scheduled_time' => '09:00',
                'service_type' => 'Cuci Motor',
                'status' => 'selesai',
                'washer_name' => 'Agus Washer',
                'started_at' => now()->subHours(2),
                'finished_at' => now()->subHours(1),
            ],
            [
                'user_id' => $customer->id,
                'queue_number' => 'A-02',
                'bike_model' => 'Yamaha NMAX',
                'plat_nomor' => 'D 5678 AB',
                'location' => 'Parkir Basement B2',
                'scheduled_time' => '10:00',
                'service_type' => 'Cuci Motor',
                'status' => 'proses',
                'washer_name' => 'Budi',
                'started_at' => now()->subMinutes(15),
            ],
            [
                'user_id' => $customer->id,
                'queue_number' => 'A-03',
                'bike_model' => 'Honda PCX 160',
                'plat_nomor' => 'F 9012 CD',
                'location' => 'Parkir Timur Lt. 2',
                'scheduled_time' => '10:30',
                'service_type' => 'Cuci Motor',
                'status' => 'menunggu',
            ],
        ];

        foreach ($bookings as $b) {
            Booking::firstOrCreate(['queue_number' => $b['queue_number']], $b);
        }
    }
}
