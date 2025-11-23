<?php

namespace App\Models;

use App\Traits\Uuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    use HasFactory, Uuid;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'user_id',
        'storage_id',
        'quantity',
        'is_used',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'is_used' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function storage()
    {
        return $this->belongsTo(Storage::class, 'storage_id');
    }
}
