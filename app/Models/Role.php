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

    public function index(int $per_page, int $page = 1)
    {
        $roles = parent::simplePaginate($per_page, ['*'], 'page', $page);

        if ($roles->isEmpty()) {
            return null;
        }

        return $roles;
    }

    


    public function create(array $data)
    {
        $role = parent::create($data);

        if (!$role) {
            return null;
        }

        return $role;
    }
}