<?php

namespace App\Models;

use App\Traits\Uuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Wheel extends Model
{
    /** @use HasFactory<\Database\Factories\WheelFactory> */
    use HasFactory, Notifiable;

    use Uuid;

    protected $fillable = [
        'storage_id',
        'start_degree',
        'end_degree',
    ];

    protected $hidden = [
        'storage_id',
    ];

    protected $appends = [
        'storage',
    ];

    public function storage()
    {
        return $this->belongsTo(Storage::class, 'storage_id', 'id');
    }

    public function getStorageAttribute()
    {
        $storage = $this->relationLoaded('storage') ? $this->relations['storage'] : $this->storage()->first();

        return $storage;
    }
}
