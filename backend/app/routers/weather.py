from fastapi import APIRouter, Query

from app.services.location_interpreter import interpret_location
from app.services.nominatim import resolve_location
from app.services.openweather import get_current_weather, get_forecast

router = APIRouter(prefix="/weather", tags=["weather"])


@router.get("/current")
async def current_weather(location: str = Query(..., description="City, zip code, coordinates, or natural language")):
    location = await interpret_location(location)
    geo = await resolve_location(location)
    weather = await get_current_weather(geo["latitude"], geo["longitude"])
    return {
        "resolved_location": geo["resolved_name"],
        "latitude": geo["latitude"],
        "longitude": geo["longitude"],
        "weather": weather,
    }


@router.get("/forecast")
async def forecast(location: str = Query(..., description="City, zip code, coordinates, or natural language")):
    location = await interpret_location(location)
    geo = await resolve_location(location)
    forecast_data = await get_forecast(geo["latitude"], geo["longitude"])
    return {
        "resolved_location": geo["resolved_name"],
        "latitude": geo["latitude"],
        "longitude": geo["longitude"],
        "forecast": forecast_data,
    }
