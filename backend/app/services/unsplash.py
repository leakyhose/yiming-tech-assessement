import httpx
from fastapi import HTTPException

from app.config import settings

UNSPLASH_SEARCH_URL = "https://api.unsplash.com/search/photos"


async def get_photos(location: str) -> list:
    """
    Search Unsplash for photos of the given location.
    Returns list of {url, alt, photographer, photographer_url}.
    """
    # Use just the location name - Unsplash matches landmarks well
    params = {
        "query": location,
        "per_page": 3,
        "orientation": "landscape",
        "client_id": settings.UNSPLASH_ACCESS_KEY,
    }
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.get(UNSPLASH_SEARCH_URL, params=params)
            resp.raise_for_status()
            data = resp.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=502,
                detail=f"Unsplash API error: {e.response.text}",
            )
        except httpx.RequestError as e:
            raise HTTPException(status_code=502, detail=f"Unsplash API unreachable: {e}")

    results = data.get("results", [])
    return [
        {
            "url": photo["urls"]["regular"],
            "alt": photo.get("alt_description") or location,
            "photographer": photo["user"]["name"],
            "photographer_url": photo["user"]["links"]["html"],
        }
        for photo in results
    ]
