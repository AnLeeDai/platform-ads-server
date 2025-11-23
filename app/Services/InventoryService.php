<?php

namespace App\Services;

use App\Models\Inventory;
use Illuminate\Support\Facades\Cache;

class InventoryService
{
    protected $cacheTtl = 3600; // 1 hour

    public function getUserInventories(string $userId, int $perPage = 10, int $page = 1)
    {
        $cacheKey = "user_inventories_{$userId}_page_{$page}_per_{$perPage}";

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($userId, $perPage, $page) {
            return Inventory::with('storage')
                ->where('user_id', $userId)
                ->simplePaginate($perPage, ['*'], 'page', $page);
        });
    }

    public function markAsUsed(string $inventoryId, string $userId): Inventory
    {
        $inventory = Inventory::where('id', $inventoryId)->where('user_id', $userId)->first();

        if (! $inventory) {
            throw new \Exception('Inventory item not found');
        }

        if ($inventory->is_used) {
            throw new \Exception('Item already used');
        }

        $inventory->is_used = true;
        $inventory->save();

        // Clear cache
        Cache::forget("user_inventories_{$userId}_page_*"); // Note: This is a pattern, in real Laravel use tags or specific keys

        return $inventory;
    }
}
