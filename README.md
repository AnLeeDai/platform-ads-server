php artisan octane:start --watch
composer require league/flysystem-aws-s3-v3 "^3.0" --with-all-dependencies
php artisan tinker --execute='dump(Storage::disk("r2")->put("test-connect.txt", "Ket noi thanh cong!"));'

// r2 config
'r2' => [
'driver' => 's3',
'key' => env('CLOUDFLARE_R2_ACCESS_KEY_ID'),
'secret' => env('CLOUDFLARE_R2_SECRET_ACCESS_KEY'),
'region' => 'us-east-1',
'bucket' => env('CLOUDFLARE_R2_BUCKET'),
'url' => env('CLOUDFLARE_R2_URL'),
'visibility' => 'private',
'endpoint' => env('CLOUDFLARE_R2_ENDPOINT'),
'throw' => false,
],
