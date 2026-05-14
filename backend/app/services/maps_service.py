"""
Google Maps / Places service — nearby psychologist search (premium only).
Queries the Places API nearbysearch endpoint for mental health professionals.
Returns empty list with a warning when no API key is configured.
"""
import httpx
from app.config import settings

PLACES_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
PLACE_DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json"


async def get_nearby_psychologists(lat: float, lng: float, radius_meters: int = 10000) -> list:
    if not settings.google_maps_api_key:
        return []  # Frontend will show "API key not configured" placeholder

    params = {
        "location": f"{lat},{lng}",
        "radius": radius_meters,
        "type": "doctor",
        "keyword": "psychiatrist psychologist therapist mental health",
        "key": settings.google_maps_api_key,
    }

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(PLACES_URL, params=params)
        resp.raise_for_status()
        data = resp.json()

    results = []
    for place in data.get("results", [])[:20]:
        results.append({
            "place_id": place.get("place_id"),
            "name": place.get("name"),
            "address": place.get("vicinity"),
            "rating": place.get("rating"),
            "user_ratings_total": place.get("user_ratings_total", 0),
            "open_now": place.get("opening_hours", {}).get("open_now"),
            "lat": place["geometry"]["location"]["lat"],
            "lng": place["geometry"]["location"]["lng"],
            "types": place.get("types", []),
        })
    return results
