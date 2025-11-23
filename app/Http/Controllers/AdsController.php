<?php

namespace App\Http\Controllers;

use App\Models\Ads;
use App\Http\Requests\AdsGetRequest;
use App\Http\Requests\AdsPostRequest;
use App\Services\AdsService;

class AdsController extends Controller
{
    private Ads $adsModel;
    private AdsService $adsService;

    public function __construct(
        Ads $adsModel,
        AdsService $adsService
    ) {
        $this->adsModel = $adsModel;
        $this->adsService = $adsService;
    }

    public function index(AdsGetRequest $request)
    {
        try {
            $validated = $request->validated();

            $perPage = $validated['per_page'] ?? 10;
            $page = $validated['page'] ?? 1;

            $ads = $this->adsService->getAds($perPage, $page);

            if ($ads->isEmpty()) { 
                return $this->errorResponse('No ads found', 404);
            }

            return $this->successResponse($ads);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve ads', 500);
        }
    }

    public function store(AdsPostRequest $request)
    {
        try {
            $validated = $request->validated();

            $ad = $this->adsService->createAd($validated);

            if (!$ad) {
                return $this->errorResponse('Failed to create ad', 500);
            }

            return $this->successResponse($ad);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to create ad', 500);
        }
    }
}
