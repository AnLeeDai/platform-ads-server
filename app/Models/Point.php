<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Uuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;

class Point extends Model
{
    use Uuid;
    use HasFactory, Notifiable;

    protected $fillable = [
        'balance',
    ];

    protected $appends = [
        'user'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function getUserAttribute()
    {
        $user = ($this->relationLoaded('user')) ? $this->getRelationValue('user') : $this->user()->first();
        return $user;
    }
}
