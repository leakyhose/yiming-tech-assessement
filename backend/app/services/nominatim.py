import httpx
from fastapi import HTTPException


async def resolve_location(query: str) -> dict:
    """
    Geocode a location string using Nominatim (OpenStreetMap).
    Returns {resolved_name, latitude, longitude}.
    Raises HTTPException 404 if no results found.
    """
    url = "https://nominatim.openstreetmap.org/search"
    params = {"q": query, "format": "json", "limit": 1}
    headers = {"User-Agent": "WeatherApp/1.0 (tech-assessment)"}

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.get(url, params=params, headers=headers)
            resp.raise_for_status()
            results = resp.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=502, detail=f"Geocoding service error: {e}")
        except httpx.RequestError as e:
            raise HTTPException(status_code=502, detail=f"Geocoding service unreachable: {e}")

    if not results:
        raise HTTPException(
            status_code=404,
            detail=f"Location not found: '{query}'. Try a city name, zip code, or coordinates.",
        )

    result = results[0]
    return {
        "resolved_name": result.get("display_name", query),
        "latitude": float(result["lat"]),
        "longitude": float(result["lon"]),
    }
