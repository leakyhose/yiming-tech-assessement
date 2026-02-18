from urllib.parse import quote

from app.config import settings
from app.services.nominatim import resolve_location


async def get_map_data(location: str) -> dict:
    """
    Geocode the location and build a Google Maps Embed URL.
    Returns {latitude, longitude, resolved_name, embed_url}.
    """
    geo = await resolve_location(location)
    encoded_name = quote(geo["resolved_name"])
    embed_url = (
        f"https://www.google.com/maps/embed/v1/place"
        f"?key={settings.GOOGLE_MAPS_API_KEY}&q={encoded_name}"
    )
    return {
        "latitude": geo["latitude"],
        "longitude": geo["longitude"],
        "resolved_name": geo["resolved_name"],
        "embed_url": embed_url,
    }
