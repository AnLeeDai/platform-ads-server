<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Traits\Uuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * @property string $id
 * @property string|null $role_id
 */
class User extends Authenticatable
{
    use Uuid;

    /**
     * Model key type is string (UUID).
     *
     * @var string
     */
    protected $keyType = 'string';

    /**
     * Primary keys are not incrementing when using UUIDs.
     *
     * @var bool
     */
    public $incrementing = false;

    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected static function boot()
    {
        parent::boot();

        static::created(function ($user) {
            $user->point()->create(['balance' => 0]);
        });
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'role_id',
        'user_name',
        'avatar_url',
        'email',
        'phone_number',
        'password_hash',
        'is_active',
        'is_verify',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password_hash',
        'remember_token',
        'email_verified_at',
        'role_id',
    ];

    /**
     * Attributes appended to model JSON form.
     *
     * @var array<int,string>
     */
    protected $appends = [
        'role',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @var array<string,string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_active' => 'boolean',
        'is_verify' => 'boolean',
    ];

    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    public function point()
    {
        return $this->hasOne(Point::class, 'user_id');
    }

    public function inventories()
    {
        return $this->hasMany(Inventory::class, 'user_id');
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'user_id');
    }

    public function getRoleAttribute()
    {
        $role = ($this->relationLoaded('roles')) ? $this->getRelationValue('role') : $this->role()->first();

        return $role?->only(['id', 'name']);
    }
}
