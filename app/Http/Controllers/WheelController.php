<?php

namespace App\Http\Controllers;

use App\Models\Storage;
use App\Models\Wheel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class WheelController extends Controller
{
    private Wheel $wheelModel;
    private Storage $storageModel;

    private const string CACHE_KEY_WHEELS = 'wheel_segments_with_storage';

    public function __construct(
        Wheel $wheelModel,
        Storage $storageModel
    ) {
        $this->wheelModel = $wheelModel;
        $this->storageModel = $storageModel;
    }

    private function rebuildWheelCache(): void
    {
        $wheels = $this->wheelModel->with('storage')->get();

        $data = $wheels->map(fn($wheel) => [
            'start_degree' => (int) $wheel->start_degree,
            'end_degree' => (int) $wheel->end_degree,
            'storage' => $wheel->storage ? [
                'id' => $wheel->storage->id,
                'name' => $wheel->storage->name,
                'interest_rate' => (float) ($wheel->storage->interest_rate ?? 0),
            ] : null,
        ])->values()->all();

        Cache::forever(self::CACHE_KEY_WHEELS, $data);
    }

    public function index()
    {
        try {
            $wheels = $this->wheelModel->all();

            if ($wheels->isEmpty()) {
                return $this->errorResponse('No wheels found', 404);
            }

            return $this->successResponse($wheels, message: 'Wheels retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse(message: 'Server Error', status: 500, data: $e->getMessage());
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'storage_id' => 'nullable|uuid|exists:storages,id',
                'import_all' => 'nullable|boolean',
            ]);

            if (!empty($validated['import_all']) && $validated['import_all'] == true) {

                $storages = $this->storageModel::select('id')->get();

                if ($storages->isEmpty()) {
                    return $this->errorResponse('No storage found to import', 422);
                }

                $created = [];

                $total = $storages->count();
                $baseSegment = intdiv(360, $total);
                $remainder = 360 % $total;
                $currentStart = 0;

                foreach ($storages as $index => $storage) {
                    $extra = ($index < $remainder) ? 1 : 0;

                    $segmentSize = $baseSegment + $extra;

                    $startDegree = $currentStart;
                    $endDegree = $currentStart + $segmentSize - 1;

                    if ($endDegree > 359) {
                        $endDegree = 0;
                    }

                    $wheel = $this->wheelModel->create([
                        'storage_id' => $storage->id,
                        'start_degree' => $startDegree,
                        'end_degree' => $endDegree,
                    ]);

                    $created[] = $wheel;

                    $currentStart = $endDegree + 1;
                    if ($currentStart > 359) {
                        $currentStart = 0;
                    }
                }

                $this->rebuildWheelCache();

                return $this->successResponse(
                    $created,
                    'All storages imported into wheel successfully',
                    201
                );
            }

            if (empty($validated['storage_id'])) {
                return $this->errorResponse('storage_id is required when import_all = false', 422);
            }

            $maxAttempts = 20;
            $attempt = 0;
            $isOverlap = false;

            do {
                $attempt++;

                $startDegree = rand(0, 359);
                $endDegree = rand($startDegree, 359);

                $isOverlap = $this->wheelModel
                    ->where('start_degree', '<=', $endDegree)
                    ->where('end_degree', '>=', $startDegree)
                    ->exists();

            } while ($isOverlap && $attempt < $maxAttempts);

            if ($isOverlap) {
                return $this->errorResponse(
                    'Failed to create wheel without overlapping degrees after multiple attempts',
                    422
                );
            }

            $wheel = $this->wheelModel->create([
                'storage_id' => $validated['storage_id'],
                'start_degree' => $startDegree,
                'end_degree' => $endDegree,
            ]);

            if (!$wheel) {
                return $this->errorResponse('Failed to create wheel', 500);
            }

            $this->rebuildWheelCache();

            return $this->successResponse($wheel, 'Wheel created successfully', 201);

        } catch (\Exception $e) {
            return $this->errorResponse('Server Error', 500, $e->getMessage());
        }
    }

    public function deleteAll()
    {
        try {
            $this->wheelModel->truncate();
            Cache::forget(self::CACHE_KEY_WHEELS);

            return $this->successResponse(
                message: 'All wheels deleted successfully',
                data: null
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                message: 'Server Error',
                status: 500,
                data: $e->getMessage()
            );
        }
    }

    public function startSpin()
    {
        try {
            $wheels = Cache::get(self::CACHE_KEY_WHEELS, []);

            if (empty($wheels)) {
                return $this->errorResponse('No wheels configured or cache empty', 404);
            }

            $missChancePercent = 5;
            if (rand(1, 100) <= $missChancePercent) {
                $degree = rand(0, 359);

                return $this->successResponse([
                    'is_win' => false,
                    'degree' => $degree,
                    'storage' => null,
                ], 'No prize (miss)');
            }

            $totalWeight = 0.0;
            foreach ($wheels as $wheel) {
                $rate = (float) ($wheel['storage']['interest_rate'] ?? 0);
                $totalWeight += $rate;
            }

            $chosenWheel = null;

            if ($totalWeight > 0) {
                $r = lcg_value() * $totalWeight;
                $cum = 0.0;

                foreach ($wheels as $wheel) {
                    $cum += (float) ($wheel['storage']['interest_rate'] ?? 0);
                    if ($r <= $cum) {
                        $chosenWheel = $wheel;
                        break;
                    }
                }

                if (!$chosenWheel) {
                    $chosenWheel = end($wheels);
                }

            } else {
                $degreeSegments = [];
                $totalDegrees = 0;

                foreach ($wheels as $wheel) {
                    $s = (int) $wheel['start_degree'];
                    $e = (int) $wheel['end_degree'];

                    $size = ($s <= $e) ? $e - $s + 1 : 360 - $s + $e + 1;

                    $degreeSegments[] = ['wheel' => $wheel, 'size' => $size];
                    $totalDegrees += $size;
                }

                $r = rand(0, $totalDegrees - 1);
                $cum = 0;

                foreach ($degreeSegments as $seg) {
                    $cum += $seg['size'];
                    if ($r < $cum) {
                        $chosenWheel = $seg['wheel'];
                        break;
                    }
                }

                if (!$chosenWheel) {
                    $chosenWheel = end($degreeSegments)['wheel'];
                }
            }

            $s = (int) $chosenWheel['start_degree'];
            $e = (int) $chosenWheel['end_degree'];

            if ($s <= $e) {
                $degree = rand($s, $e);
            } else {
                $part1 = 360 - $s;
                $part2 = $e + 1;
                $total = $part1 + $part2;
                $r = rand(0, $total - 1);

                $degree = ($r < $part1) ? $s + $r : $r - $part1;
            }

            error_log("Chosen wheel: " . json_encode($chosenWheel) . ", Degree: $degree");

            return $this->successResponse([
                'is_win' => true,
                'degree' => $degree,
                'storage' => $chosenWheel['storage'],
            ], 'Spin result');

        } catch (\Exception $e) {
            return $this->errorResponse(
                message: 'Server Error',
                status: 500,
                data: $e->getMessage()
            );
        }
    }
}
