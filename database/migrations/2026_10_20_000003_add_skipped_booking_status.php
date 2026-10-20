<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table): void {
            $table->text('skip_reason')->nullable()->after('status');
        });

        if (Schema::getConnection()->getDriverName() === 'mysql') {
            Schema::table('bookings', function (Blueprint $table): void {
                $table->enum('status', ['menunggu', 'proses', 'selesai', 'dilewati'])->default('menunggu')->change();
            });
        }
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table): void {
            $table->dropColumn('skip_reason');
        });

        if (Schema::getConnection()->getDriverName() === 'mysql') {
            Schema::table('bookings', function (Blueprint $table): void {
                $table->enum('status', ['menunggu', 'proses', 'selesai'])->default('menunggu')->change();
            });
        }
    }
};
