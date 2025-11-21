<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoragePostRequest;
use App\Http\Requests\StorageGetRequest;
use App\Models\Storage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StorageController extends Controller
{
    private Storage $storageModel;

    public function __construct(Storage $storage)
    {
        $this->storageModel = $storage;
    }

    public function index(StorageGetRequest $request)
    {
        try {
            $validated = $request->validated();

            $per_page = $validated['per_page'];
            $page = $validated['page'];


            $storages = $this->storageModel->simplePaginate($per_page, ['*'], 'page', $page);
            $totalItems = $this->storageModel->count();
            $totalQuantity = $this->storageModel->sum('quantity');

            if ($storages->isEmpty()) {
                return $this->errorResponse('No storages found', 404);
            }

            return $this->successResponse(
                message: 'Storages retrieved successfully',
                data: [
                    'total_items' => $totalItems,
                    'total_quantity' => $totalQuantity,
                    'items' => $storages,
                ]
            );
        } catch (\Exception $e) {
            return $this->errorResponse(message: 'Server Error', status: 500, data: $e->getMessage());
        }
    }

    public function store(StoragePostRequest $request)
    {
        try {
            $validated = $request->validated();

            DB::beginTransaction();

            $created = [];
            foreach ($validated as $item) {
                $created[] = $this->storageModel->create($item);
            }

            DB::commit();

            return $this->successResponse(
                message: 'Storages created successfully',
                data: $created,
                status: 201
            );

        } catch (\Exception $e) {
            DB::rollBack();

            return $this->errorResponse(
                message: 'Server Error',
                status: 500,
                data: $e->getMessage()
            );
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'quantity' => 'sometimes|integer|min:0',
                'interest_rate' => 'required|numeric|min:0',
            ]);

            $storage = $this->storageModel->find($id);

            if (!$storage) {
                return $this->errorResponse(message: 'Storage not found', status: 404);
            }

            $storage->update($validated);

            return $this->successResponse(
                message: 'Storage updated successfully',
                data: $storage
            );

        } catch (\Exception $e) {
            return $this->errorResponse(message: 'Server Error', status: 500, data: $e->getMessage());
        }
    }

}
