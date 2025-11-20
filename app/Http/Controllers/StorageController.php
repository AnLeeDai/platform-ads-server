<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoragePostRequest;
use App\Http\Requests\StorageGetRequest;
use App\Models\Storage;

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
            $items = $request->all();
            $created = [];

            foreach ($items as $item) {
                $created[] = $this->storageModel->create($item);
            }

            if (empty($created)) {
                return $this->errorResponse(
                    message: 'Failed to create storage',
                    status: 500
                );
            }

            return $this->successResponse(
                message: 'Storage created successfully',
                data: $created
            );

        } catch (\Exception $e) {
            return $this->errorResponse(
                message: 'Server Error',
                status: 500,
                data: $e->getMessage()
            );
        }
    }
}
