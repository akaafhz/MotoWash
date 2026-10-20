<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'queue_number',
        'bike_model',
        'plat_nomor',
        'scheduled_time',
        'location',
        'service_type',
        'notes',
        'status',
        'skip_reason',
        'washer_name',
        'started_at',
        'finished_at',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getServicePriceAttribute(): int
    {
        return $this->service_type === 'Service Motor' ? 10000 : 15000;
    }
}
