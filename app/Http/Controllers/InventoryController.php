<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = auth()->user();

            $per_page = (int) $request->query('per_page', 10);
            $page = (int) $request->query('page', 1);

            $inventories = Inventory::with('storage')
                ->where('user_id', $user->id)
                ->simplePaginate($per_page, ['*'], 'page', $page)
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

            $inventory = Inventory::where('id', $id)->where('user_id', $user->id)->first();

            if (!$inventory) {
                return $this->errorResponse('Inventory item not found', 404);
            }

            if ($inventory->is_used) {
                return $this->errorResponse('Item already used', 400);
            }

            $inventory->is_used = true;
            $inventory->save();

            return $this->successResponse($inventory, 'Item marked as used successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Server Error', 500, $e->getMessage());
        }
    }
}
