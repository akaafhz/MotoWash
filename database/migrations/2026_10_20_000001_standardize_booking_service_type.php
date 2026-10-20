<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('bookings')
            ->whereIn('service_type', ['Express', 'Premium'])
            ->update(['service_type' => 'Standard']);

        if (DB::getDriverName() === 'mysql') {
            Schema::table('bookings', function (Blueprint $table): void {
                $table->enum('service_type', ['Standard'])
                    ->default('Standard')
                    ->change();
            });
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            Schema::table('bookings', function (Blueprint $table): void {
                $table->enum('service_type', ['Standard', 'Express', 'Premium'])
                    ->default('Standard')
                    ->change();
            });
        }
    }
};
