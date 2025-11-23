<?php

namespace App\Services;

use App\Models\Storage;
use Illuminate\Support\Facades\Cache;

class StorageService
{
    protected $cacheTtl = 3600; // 1 hour

    public function getStorages(int $perPage = 10, int $page = 1)
    {
        $cacheKey = "storages_page_{$page}_per_{$perPage}";

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($perPage, $page) {
            $storages = Storage::simplePaginate($perPage, ['*'], 'page', $page);
            $totalItems = Storage::count();
            $totalQuantity = Storage::sum('quantity');

            return [
                'storages' => $storages,
                'total_items' => $totalItems,
                'total_quantity' => $totalQuantity,
            ];
        });
    }

    public function createStorages(array $data): array
    {
        $created = [];
        foreach ($data as $item) {
            $created[] = Storage::create($item);
        }

        // Clear cache
        Cache::flush(); // Or specific keys, but for simplicity

        return $created;
    }

    public function updateStorage(int $id, array $data): Storage
    {
        $storage = Storage::find($id);
        if (! $storage) {
            throw new \Exception('Storage not found');
        }

        $storage->update($data);

        // Clear cache
        Cache::flush();

        return $storage;
    }
}
