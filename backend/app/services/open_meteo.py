from datetime import date, datetime, timezone

import httpx
from fastapi import HTTPException

ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive"
FORECAST_URL = "https://api.open-meteo.com/v1/forecast"

DAILY_VARS = "temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum"


def _merge_daily(a: dict, b: dict) -> dict:
    """Merge two Open-Meteo daily response dicts."""
    merged = {}
    for key in a:
        merged[key] = a[key] + b.get(key, [])
    return merged


async def _fetch(url: str, lat: float, lon: float, start: date, end: date) -> dict:
    params = {
        "latitude": lat,
        "longitude": lon,
        "daily": DAILY_VARS,
        "start_date": start.isoformat(),
        "end_date": end.isoformat(),
        "timezone": "auto",
        "temperature_unit": "fahrenheit",
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=502,
                detail=f"Open-Meteo error: {e.response.text}",
            )
        except httpx.RequestError as e:
            raise HTTPException(status_code=502, detail=f"Open-Meteo unreachable: {e}")


async def get_weather_for_range(lat: float, lon: float, start_date: date, end_date: date) -> dict:
    """
    Fetch weather data for a date range.
    - Past dates → archive endpoint
    - Future dates → forecast endpoint
    - Mixed ranges → split and merge
    Returns Open-Meteo daily structure.
    """
    today = datetime.now(tz=timezone.utc).date()

    if end_date <= today:
        # Entirely historical
        return await _fetch(ARCHIVE_URL, lat, lon, start_date, end_date)
    elif start_date > today:
        # Entirely in the future
        return await _fetch(FORECAST_URL, lat, lon, start_date, end_date)
    else:
        # Spans today — split at today
        past_data = await _fetch(ARCHIVE_URL, lat, lon, start_date, today)
        from datetime import timedelta
        future_start = today + timedelta(days=1)
        future_data = await _fetch(FORECAST_URL, lat, lon, future_start, end_date)
        merged = dict(past_data)
        merged["daily"] = _merge_daily(past_data["daily"], future_data["daily"])
        return merged
