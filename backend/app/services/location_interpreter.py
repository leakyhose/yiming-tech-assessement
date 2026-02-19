import json
import re
from dataclasses import dataclass

from google import genai
from app.config import settings

_client = genai.Client(api_key=settings.GEMINI_API_KEY)


@dataclass
class LocationResult:
    name: str
    lat: float | None = None
    lon: float | None = None


async def interpret_location(raw_input: str) -> LocationResult:
    """
    Use Gemini 2.5 Flash Lite to extract a location from natural language.

    Returns a LocationResult with:
    - name: clean display name (used for media searches and resolved_location)
    - lat/lon: coordinates if Gemini knows them confidently, else None

    When lat/lon are provided the caller can skip OWM geocoding entirely.
    Short inputs (< 4 words) bypass Gemini and return as-is.
    """
    try:
        response = await _client.aio.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=(
                "You are a location resolver. Given any input — a city name, zip/postal code, "
                "landmark, address, GPS coordinates, natural language description, or a vague reference "
                "like 'the city with the big tower in France' or 'where the Olympics were held in 2008' "
                "— identify the most likely real-world location and return your best guess with coordinates.\n\n"
                "Zip/postal codes must be resolved to their city (e.g. '10001' → New York, NY).\n\n"
                "Return ONLY a JSON object with these fields:\n"
                '  "name": clean human-readable location name (e.g. "New York, NY" or "Paris, France")\n'
                '  "lat": latitude as a float (always provide — use your best guess if uncertain)\n'
                '  "lon": longitude as a float (always provide — use your best guess if uncertain)\n\n'
                f"Input: {raw_input}"
            ),
        )
        # Strip markdown code fences if present
        text = re.sub(r"^```(?:json)?\s*|\s*```$", "", response.text.strip(), flags=re.MULTILINE)
        data = json.loads(text)
        lat = data.get("lat")
        lon = data.get("lon")
        return LocationResult(
            name=data.get("name") or raw_input,
            lat=float(lat) if lat is not None else None,
            lon=float(lon) if lon is not None else None,
        )
    except Exception:
        return LocationResult(name=raw_input)
