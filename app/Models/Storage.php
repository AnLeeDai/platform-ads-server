<?php

namespace App\Models;

use App\Traits\Uuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Storage extends Model
{
    /** @use HasFactory<\Database\Factories\StorageFactory> */
    use HasFactory, Notifiable;

    use Uuid;

    protected $fillable = [
        'name',
        'description',
        'quantity',
        'item_type',
        'interest_rate',
        'expired_date',
    ];

    public function inventories()
    {
        return $this->hasMany(Inventory::class, 'storage_id');
    }
}
