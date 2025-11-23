<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CloudFlareController extends Controller
{
    public function upload_image(Request $request)
    {
        try {
            $file = $request->validate(['file' => 'required|image|max:10240'])['file'];

            $name = 'img_' . date('Y-m-d_H-i-s') . '_' . uniqid() . '.webp';

            $img = imagecreatefromstring($file->get());
            if (!$img)
                throw new \Exception('Invalid Image');

            $w = imagesx($img);
            $h = imagesy($img);
            $max = 1920;

            if ($w > $max) {
                $newH = floor($h * ($max / $w));
                $tmp = imagecreatetruecolor($max, $newH);
                imagealphablending($tmp, false);
                imagesavealpha($tmp, true);
                imagecopyresampled($tmp, $img, 0, 0, 0, 0, $max, $newH, $w, $h);
                imagedestroy($img);
                $img = $tmp;
            }

            ob_start();
            imagewebp($img, null, 80);
            $content = ob_get_clean();
            imagedestroy($img);

            $disk = Storage::disk('r2');
            $disk->put("images/$name", $content);

            return $this->successResponse([
                'url' => $disk->url("images/$name"),
                'name' => $name
            ]);

        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    public function upload_video(Request $request)
    {
        set_time_limit(0);
        try {
            $file = $request->validate(['file' => 'required|file|mimetypes:video/mp4,video/mpeg,video/quicktime'])['file'];

            $name = 'vid_' . date('Y-m-d_H-i-s') . '_' . uniqid() . '.' . $file->extension();

            $disk = Storage::disk('r2');
            $path = $disk->putFileAs('videos', $file, $name);

            return $this->successResponse([
                'url' => $disk->url($path),
                'name' => $name
            ]);

        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }
}