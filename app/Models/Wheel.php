<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\Uuid;

class Wheel extends Model
{
    use Uuid;
    /** @use HasFactory<\Database\Factories\WheelFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'storage_id',
        'start_degree',
        'end_degree'
    ];

    protected $hidden = [
        'storage_id'
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
