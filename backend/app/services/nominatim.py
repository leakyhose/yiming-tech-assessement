import re

import httpx
from fastapi import HTTPException

from app.config import settings


async def resolve_location(query: str) -> dict:
    """
    Resolve a location string to {resolved_name, latitude, longitude}.

    Resolution order:
    1. GPS coordinates (e.g. "40.7128,-74.0060") - parsed directly, no API call.
    2. OWM Geocoding API - reliable for cities, towns, and zip codes.
    3. Nominatim (OpenStreetMap) - fallback for landmarks and addresses.
    """
    query = query.strip()

    # 1. GPS coordinates: "lat,lon"
    coords = re.match(r"^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$", query)
    if coords:
        lat, lon = float(coords.group(1)), float(coords.group(2))
        return {"resolved_name": f"{lat}, {lon}", "latitude": lat, "longitude": lon}

    # 2. OWM Geocoding API (primary, uses the same key, built for weather city lookups)
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.get(
                "https://api.openweathermap.org/geo/1.0/direct",
                params={"q": query, "limit": 1, "appid": settings.OPENWEATHER_API_KEY},
            )
            resp.raise_for_status()
            results = resp.json()
        except httpx.HTTPStatusError:
            results = []
        except httpx.RequestError as e:
            raise HTTPException(status_code=502, detail=f"Geocoding service unreachable: {e}")

    if results:
        r = results[0]
        name = r.get("local_names", {}).get("en") or r["name"]
        parts = [name, r.get("state", ""), r.get("country", "")]
        resolved = ", ".join(p for p in parts if p)
        return {"resolved_name": resolved, "latitude": float(r["lat"]), "longitude": float(r["lon"])}

    # 3. Nominatim fallback (landmarks, addresses OWM doesn't know)
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.get(
                "https://nominatim.openstreetmap.org/search",
                params={"q": query, "format": "json", "limit": 1},
                headers={"User-Agent": "WeatherApp/1.0 (tech-assessment)"},
            )
            resp.raise_for_status()
            nom_results = resp.json()
        except Exception:
            nom_results = []

    if nom_results:
        r = nom_results[0]
        return {
            "resolved_name": r.get("display_name", query),
            "latitude": float(r["lat"]),
            "longitude": float(r["lon"]),
        }

    raise HTTPException(
        status_code=404,
        detail=f"Location not found: '{query}'. Try a city name, zip code, or coordinates.",
    )
