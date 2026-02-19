import json
import re

from fastapi import HTTPException
from google import genai
from app.config import settings

_client = genai.Client(api_key=settings.GEMINI_API_KEY)


async def interpret_location(raw_input: str) -> dict:
    """Use Gemini to resolve any location input to a name and coordinates."""
    try:
        response = await _client.aio.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=(
                "You are a location resolver. Given any input (a city name, zip/postal code, "
                "landmark, address, GPS coordinates, natural language description, or a vague reference "
                "like 'the city with the big tower in France' or 'where the Olympics were held in 2008'), "
                "identify the most likely real-world location and return your best guess with coordinates.\n\n"
                "Zip/postal codes must be resolved to their city (e.g. '10001' resolves to New York, NY).\n\n"
                "Return ONLY a JSON object with these fields:\n"
                '  "name": clean human-readable location name (e.g. "New York, NY" or "Paris, France")\n'
                '  "lat": latitude as a float (always provide; use your best guess if uncertain)\n'
                '  "lon": longitude as a float (always provide; use your best guess if uncertain)\n\n'
                f"Input: {raw_input}"
            ),
        )
        # Strip markdown code fences if present
        text = re.sub(r"^```(?:json)?\s*|\s*```$", "", response.text.strip(), flags=re.MULTILINE)
        data = json.loads(text)
        lat = data.get("lat")
        lon = data.get("lon")
        name = data.get("name") or raw_input
        if lat is None or lon is None:
            raise HTTPException(status_code=422, detail=f"Could not resolve location: '{raw_input}'")
        return {"resolved_name": name, "latitude": float(lat), "longitude": float(lon)}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=422, detail=f"Could not resolve location: '{raw_input}'")
