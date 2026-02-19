from google import genai
from app.config import settings

_client = genai.Client(api_key=settings.GEMINI_API_KEY)


async def interpret_location(raw_input: str) -> str:
    """
    Use Gemini 2.5 Flash Lite to extract a clean location string from natural language.

    Short inputs (< 4 words) are returned as-is since they're almost certainly
    already a city name, zip code, or GPS coordinate.
    """
    if len(raw_input.split()) < 4:
        return raw_input

    try:
        response = await _client.aio.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=(
                "Extract the specific location from the input below and return ONLY "
                "the location name or coordinates — nothing else, no explanation.\n"
                "If the input is already a location (city, zip, GPS coords, landmark), return it unchanged.\n\n"
                f"Input: {raw_input}"
            ),
        )
        return response.text.strip()
    except Exception:
        # If Gemini fails for any reason, fall back to the raw input
        return raw_input
