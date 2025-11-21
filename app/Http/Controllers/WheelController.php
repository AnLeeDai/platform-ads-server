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
    private const string CACHE_KEY_WHEELS_SPIN_META = 'wheel_segments_spin_meta';

    public function __construct(
        Wheel $wheelModel,
        Storage $storageModel
    ) {
        $this->wheelModel = $wheelModel;
        $this->storageModel = $storageModel;
    }

    private function getWheelSegmentsFromCache(): array
    {
        return Cache::rememberForever(self::CACHE_KEY_WHEELS, function () {
            return $this->wheelModel
                ->with('storage')
                ->get()
                ->toArray();
        });
    }

    private function buildSpinMeta(array $wheels): array
    {
        $weightEntries = [];
        $degreeEntries = [];

        $totalWeight = 0.0;
        $totalDegrees = 0;

        foreach ($wheels as $index => $wheel) {
            $rate = (float) ($wheel['storage']['interest_rate'] ?? 0);

            $start = (int) $wheel['start_degree'];
            $end = (int) $wheel['end_degree'];

            $size = ($start <= $end)
                ? $end - $start + 1
                : 360 - $start + $end + 1;

            $weightEntries[] = [
                'index' => $index,
                'weight' => $rate,
                'cum' => 0.0,
            ];

            $degreeEntries[] = [
                'index' => $index,
                'size' => $size,
                'cum' => 0,
            ];

            $totalWeight += $rate;
            $totalDegrees += $size;
        }

        $cum = 0.0;
        foreach ($weightEntries as &$entry) {
            $cum += $entry['weight'];
            $entry['cum'] = $cum;
        }
        unset($entry);

        $cumDeg = 0;
        foreach ($degreeEntries as &$entry) {
            $cumDeg += $entry['size'];
            $entry['cum'] = $cumDeg;
        }
        unset($entry);

        return [
            'total_weight' => $totalWeight,
            'weights' => $weightEntries,
            'total_degrees' => $totalDegrees,
            'degrees' => $degreeEntries,
        ];
    }

    private function getWheelSpinMetaFromCache(): array
    {
        return Cache::rememberForever(self::CACHE_KEY_WHEELS_SPIN_META, function () {
            $wheels = $this->getWheelSegmentsFromCache();
            return $this->buildSpinMeta($wheels);
        });
    }

    private function rebuildWheelCache(): void
    {
        Cache::forget(self::CACHE_KEY_WHEELS);
        Cache::forget(self::CACHE_KEY_WHEELS_SPIN_META);

        $wheels = $this->getWheelSegmentsFromCache();
        $meta = $this->buildSpinMeta($wheels);

        Cache::forever(self::CACHE_KEY_WHEELS_SPIN_META, $meta);
    }

    private function filterStorageForUser(?array $storage): ?array
    {
        if (!is_array($storage)) {
            return $storage;
        }

        return [
            'id' => $storage['id'] ?? null,
            'name' => $storage['name'] ?? null,
            'description' => $storage['description'] ?? null,
            'expired_date' => $storage['expired_date'] ?? null,
            'item_type' => $storage['item_type'] ?? null,
            'quantity' => $storage['quantity'] ?? null,
        ];
    }

    private function transformWheelsForResponse(array $wheels): array
    {
        foreach ($wheels as &$wheel) {
            unset($wheel['created_at'], $wheel['updated_at']);

            if (isset($wheel['storage'])) {
                $wheel['storage'] = $this->filterStorageForUser($wheel['storage']);
            }
        }
        unset($wheel);

        return $wheels;
    }

    private function transformStorageForResponse(?array $storage): ?array
    {
        return $this->filterStorageForUser($storage);
    }

    public function index()
    {
        try {
            $wheels = $this->getWheelSegmentsFromCache();

            if (empty($wheels)) {
                return $this->errorResponse('No wheels found', 404);
            }

            $wheels = $this->transformWheelsForResponse($wheels);

            return $this->successResponse($wheels, message: 'Wheels retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse(message: 'Server Error', status: 500, data: $e->getMessage());
        }
    }

    public function clearCache()
    {
        try {
            $this->rebuildWheelCache();

            return $this->successResponse(
                message: 'Wheel cache cleared and rebuilt successfully',
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

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'storage_id' => 'nullable|uuid|exists:storages,id',
                'import_all' => 'nullable|boolean',
            ]);

            if (!empty($validated['import_all']) && $validated['import_all'] === true) {
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
                        $endDegree = 359;
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
            Cache::forget(self::CACHE_KEY_WHEELS_SPIN_META);

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
            $wheels = $this->getWheelSegmentsFromCache();

            if (empty($wheels)) {
                return $this->errorResponse('No wheels configured or cache empty', 404);
            }

            $meta = $this->getWheelSpinMetaFromCache();

            $missChancePercent = 5;
            if (rand(1, 100) <= $missChancePercent) {
                $degree = rand(0, 359);

                return $this->successResponse([
                    'is_win' => false,
                    'degree' => $degree,
                    'storage' => null,
                ], 'No prize (miss)');
            }

            $chosenWheel = null;

            if ($meta['total_weight'] > 0) {
                $r = lcg_value() * $meta['total_weight'];
                foreach ($meta['weights'] as $entry) {
                    if ($r <= $entry['cum']) {
                        $chosenWheel = $wheels[$entry['index']] ?? null;
                        break;
                    }
                }

                if (!$chosenWheel) {
                    $lastIndex = array_key_last($wheels);
                    $chosenWheel = $wheels[$lastIndex];
                }
            } else {
                if ($meta['total_degrees'] <= 0) {
                    return $this->errorResponse('Invalid wheel configuration', 500);
                }

                $r = rand(0, $meta['total_degrees'] - 1);
                foreach ($meta['degrees'] as $entry) {
                    if ($r < $entry['cum']) {
                        $chosenWheel = $wheels[$entry['index']] ?? null;
                        break;
                    }
                }

                if (!$chosenWheel) {
                    $lastIndex = array_key_last($wheels);
                    $chosenWheel = $wheels[$lastIndex];
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

            $storage = $chosenWheel['storage'] ?? null;
            $storage = \is_array($storage) ? $this->transformStorageForResponse($storage) : $storage;

            return $this->successResponse([
                'is_win' => true,
                'degree' => $degree,
                'storage' => $storage,
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