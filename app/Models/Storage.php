<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\Uuid;


class Storage extends Model
{
    use Uuid;
    /** @use HasFactory<\Database\Factories\StorageFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'description',
        'quantity',
        'percent',
    ];
}
