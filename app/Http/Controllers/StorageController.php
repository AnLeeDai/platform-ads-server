<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorageGetRequest;
use App\Http\Requests\StoragePostRequest;
use App\Http\Requests\StorageUpdateRequest;
use App\Models\Storage;
use App\Services\StorageService;
use Illuminate\Support\Facades\DB;

class StorageController extends Controller
{
    private Storage $storageModel;

    private StorageService $storageService;

    public function __construct(Storage $storage, StorageService $storageService)
    {
        $this->storageModel = $storage;
        $this->storageService = $storageService;
    }

    public function index(StorageGetRequest $request)
    {
        try {
            $validated = $request->validated();

            $per_page = $validated['per_page'];
            $page = $validated['page'];

            $data = $this->storageService->getStorages($per_page, $page);

            if ($data['storages']->isEmpty()) {
                return $this->errorResponse('No storages found', 404);
            }

            return $this->successResponse(
                message: 'Storages retrieved successfully',
                data: [
                    'total_items' => $data['total_items'],
                    'total_quantity' => $data['total_quantity'],
                    'items' => $data['storages'],
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

            $created = $this->storageService->createStorages($validated);

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

    public function update(StorageUpdateRequest $request, $id)
    {
        try {
            $validated = $request->validated();

            $storage = $this->storageService->updateStorage($id, $validated);

            return $this->successResponse(
                message: 'Storage updated successfully',
                data: $storage
            );

        } catch (\Exception $e) {
            return $this->errorResponse(message: 'Server Error', status: 500, data: $e->getMessage());
        }
    }
}
