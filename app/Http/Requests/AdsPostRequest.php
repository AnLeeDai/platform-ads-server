<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdsPostRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'duration' => 'required|integer|min:1',
            'poster_url' => 'required|url',
            'video_url' => 'required|url',
            'is_active' => 'required|boolean',
            'point_reward' => 'required|integer|min:0',
        ];
    }
}
