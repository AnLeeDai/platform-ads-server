<?php

namespace App\Http\Controllers;

use App\Services\InventoryService;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    protected InventoryService $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    public function index(Request $request)
    {
        try {
            $user = auth()->user();

            $per_page = (int) $request->query('per_page', 10);
            $page = (int) $request->query('page', 1);

            $inventories = $this->inventoryService->getUserInventories($user->id, $per_page, $page)
                ->through(function ($inventory) {
                    return [
                        'id' => $inventory->id,
                        'storage' => [
                            'id' => $inventory->storage->id,
                            'name' => $inventory->storage->name,
                            'description' => $inventory->storage->description,
                            'item_type' => $inventory->storage->item_type,
                            'expired_date' => $inventory->storage->expired_date,
                        ],
                        'quantity' => $inventory->quantity,
                        'is_used' => $inventory->is_used,
                        'created_at' => $inventory->created_at,
                        'updated_at' => $inventory->updated_at,
                    ];
                });

            return $this->successResponse($inventories, 'Inventory retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Server Error', 500, $e->getMessage());
        }
    }

    public function markAsUsed(Request $request, $id)
    {
        try {
            $user = auth()->user();

            $inventory = $this->inventoryService->markAsUsed($id, $user->id);

            return $this->successResponse($inventory, 'Item marked as used successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Server Error', 500, $e->getMessage());
        }
    }
}
