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
            ->where('service_type', 'Standard')
            ->update(['service_type' => 'Cuci Motor']);

        if (DB::getDriverName() === 'mysql') {
            Schema::table('bookings', function (Blueprint $table): void {
                $table->enum('service_type', ['Cuci Motor', 'Service Motor'])
                    ->default('Cuci Motor')
                    ->change();
            });
        }
    }

    public function down(): void
    {
        DB::table('bookings')
            ->where('service_type', 'Service Motor')
            ->update(['service_type' => 'Cuci Motor']);

        if (DB::getDriverName() === 'mysql') {
            Schema::table('bookings', function (Blueprint $table): void {
                $table->enum('service_type', ['Standard'])
                    ->default('Standard')
                    ->change();
            });
        }
    }
};
