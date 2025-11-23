<?php

namespace App\Services;

use App\Models\Ads;
use Illuminate\Support\Facades\Cache;

class AdsService
{
    protected $cacheTtl = 3600; // 1 hour

    public function getAds(int $perPage = 10, int $page = 1)
    {
        $cacheKey = "ads_page_{$page}_per_{$perPage}";

        return Cache::remember($cacheKey, $this->cacheTtl, fn() => Ads::simplePaginate($perPage, ['*'], 'page', $page));
    }

    public function createAd(array $data): Ads
    {

        dd($data);

        Cache::flush();
        return Ads::create($data);
    }
}