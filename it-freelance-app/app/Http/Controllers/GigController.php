<?php

namespace App\Http\Controllers;

use App\Models\Gig;
use App\Http\Resources\GigResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GigController extends Controller
{
    /**
     * Display all gigs (for buyers) or the user's gigs (for sellers).
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        if ($user->user_type === 'buyer') {
            $gigs = Gig::query();

            if ($request->has('category')) {
                $gigs->whereHas('category', function ($query) use ($request) {
                    $query->where('name', $request->category);
                });
            }

            return GigResource::collection($gigs->get());
        }

        if ($user->user_type === 'seller') {
            return GigResource::collection($user->gigs);
        }

        return response()->json(['error' => 'Unauthorized access'], 403);
    }

    /**
     * Display gigs created by the authenticated seller.
     * This route is specifically for sellers to manage their own gigs.
     */
    public function myGigs()
    {
        $user = Auth::user();

        if ($user->user_type !== 'seller') {
            return response()->json(['error' => 'Only sellers can access this resource'], 403);
        }

        return GigResource::collection($user->gigs);
    }

    /**
     * Display a specific gig only if authorized.
     */
    public function show($id)
    {
        $gig = Gig::findOrFail($id);
        $user = Auth::user();

        if ($user->user_type === 'buyer') {
            return new GigResource($gig);
        }

        if ($user->user_type === 'seller' && $gig->user_id === $user->id) {
            return new GigResource($gig);
        }

        return response()->json(['error' => 'Unauthorized to view this gig'], 403);
    }

    /**
     * Store a newly created gig (only for sellers).
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        if ($user->user_type !== 'seller') {
            return response()->json(['error' => 'Only sellers can create gigs.'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'price' => 'required|numeric',
            'delivery_time' => 'required|integer',
            'category' => 'required|string',
        ]);

        // Find the category ID from the category name or create it
        $category = \App\Models\Category::where('name', $validated['category'])->first();
        
        if (!$category) {
            // If category doesn't exist, create it
            $category = \App\Models\Category::create(['name' => $validated['category']]);
        }

        $gig = Gig::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'price' => $validated['price'],
            'delivery_time' => $validated['delivery_time'],
            'category_id' => $category->id,
            'user_id' => $user->id,
        ]);

        return new GigResource($gig);
    }

    /**
     * Update an existing gig (only for sellers).
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $gig = Gig::findOrFail($id);

        if ($user->user_type !== 'seller' || $gig->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized to update this gig.'], 403);
        }

        $validated = $request->validate([
            'title' => 'string',
            'description' => 'string',
            'price' => 'numeric',
            'delivery_time' => 'integer',
            'category_id' => 'exists:categories,id',
        ]);

        $gig->update($validated);

        return new GigResource($gig);
    }

    /**
     * Update only the rating and feedback of a gig (only for sellers).
     */
    public function updateRatingFeedback(Request $request, $id)
    {
        $user = Auth::user();
        $gig = Gig::findOrFail($id);

        if ($user->user_type !== 'buyer') {
            return response()->json(['error' => 'Unauthorized to update rating and feedback.'], 403);
        }

        $validated = $request->validate([
            'rating' => 'numeric|min:1|max:5',
            'feedback' => 'string|nullable',
        ]);

        $gig->update($validated);

        return new GigResource($gig);
    }

    /**
     * Delete a gig (only for the gig's creator and a seller).
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $gig = Gig::findOrFail($id);

        if ($user->user_type !== 'seller' || $gig->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized to delete this gig.'], 403);
        }

        $gig->delete();

        return response()->json(['message' => 'Gig deleted successfully']);
    }
}
