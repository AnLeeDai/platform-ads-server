<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Role::updateOrCreate(
            [
                'name' => 'admin',
            ],
            [
                'description' => 'Role dành riêng cho quản trị viên với full chức năng',
            ]
        );

        Role::updateOrCreate(
            [
                'name' => 'user',
            ],
            [
                'description' => 'Role dành riêng cho người dùng với các chức năng cơ bản',
            ]
        );

        $adminRole = Role::where('name', 'admin')->first();
        User::updateOrCreate([
            'role_id' => $adminRole->id,
            'avatar_url' => 'https://placehold.co/400',
            'user_name' => 'admin',
            'email' => 'admin@platform-ads.com',
            'phone_number' => '000000000',
            'password_hash' => bcrypt('AdminPlatformAds123!'),
        ]);
    }
}
