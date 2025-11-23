<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Uuid;

class Ads extends Model
{
    use Uuid;

    protected $fillable = [
        'title',
        'description',
        'duration',
        'poster_url',
        'video_url',
        'is_active',
        'point_reward',
    ];
}
