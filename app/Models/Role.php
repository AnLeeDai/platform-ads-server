<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\Uuid;

class Role extends Model
{
    use Uuid;
    /** @use HasFactory<\Database\Factories\RoleFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'description',
    ];
}