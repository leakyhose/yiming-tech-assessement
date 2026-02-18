from datetime import datetime, timezone

import httpx
from fastapi import HTTPException

from app.config import settings

OWM_BASE = "https://api.openweathermap.org/data/2.5"


async def get_current_weather(lat: float, lon: float) -> dict:
    """Fetch current weather from OpenWeatherMap."""
    params = {
        "lat": lat,
        "lon": lon,
        "appid": settings.OPENWEATHER_API_KEY,
        "units": "imperial",
    }
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.get(f"{OWM_BASE}/weather", params=params)
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=502,
                detail=f"Weather service error: {e.response.text}",
            )
        except httpx.RequestError as e:
            raise HTTPException(status_code=502, detail=f"Weather service unreachable: {e}")


async def get_forecast(lat: float, lon: float) -> dict:
    """
    Fetch 5-day / 3-hour forecast from OpenWeatherMap and collapse to daily.
    Returns a list of daily summaries.
    """
    params = {
        "lat": lat,
        "lon": lon,
        "appid": settings.OPENWEATHER_API_KEY,
        "units": "imperial",
        "cnt": 40,
    }
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.get(f"{OWM_BASE}/forecast", params=params)
            resp.raise_for_status()
            data = resp.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=502,
                detail=f"Forecast service error: {e.response.text}",
            )
        except httpx.RequestError as e:
            raise HTTPException(status_code=502, detail=f"Forecast service unreachable: {e}")

    # Collapse 3-hour slots to daily summaries
    days: dict[str, list] = {}
    for entry in data.get("list", []):
        dt = datetime.fromtimestamp(entry["dt"], tz=timezone.utc)
        day_key = dt.strftime("%Y-%m-%d")
        days.setdefault(day_key, []).append(entry)

    daily = []
    for day_key, entries in sorted(days.items()):
        temps = [e["main"]["temp"] for e in entries]
        icons = [e["weather"][0]["icon"] for e in entries]
        descriptions = [e["weather"][0]["description"] for e in entries]
        humidity_vals = [e["main"]["humidity"] for e in entries]
        # Pick the midday entry for icon/description if available, else first
        midday = next(
            (e for e in entries if "12" in datetime.fromtimestamp(e["dt"], tz=timezone.utc).strftime("%H")),
            entries[len(entries) // 2],
        )
        daily.append({
            "date": day_key,
            "temp_min": round(min(temps), 1),
            "temp_max": round(max(temps), 1),
            "humidity": round(sum(humidity_vals) / len(humidity_vals)),
            "icon": midday["weather"][0]["icon"],
            "description": midday["weather"][0]["description"].title(),
        })

    return {"city": data.get("city", {}), "daily": daily}
