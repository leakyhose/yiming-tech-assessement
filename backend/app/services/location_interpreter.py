import anthropic
from app.config import settings

_client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)


async def interpret_location(raw_input: str) -> str:
    """
    Use Claude Haiku to extract a clean location string from natural language.

    Short inputs (< 4 words) are returned as-is since they're almost certainly
    already a city name, zip code, or GPS coordinate.
    """
    if len(raw_input.split()) < 4:
        return raw_input

    try:
        message = await _client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=64,
            messages=[
                {
                    "role": "user",
                    "content": (
                        "Extract the specific location from the input below and return ONLY "
                        "the location name or coordinates — nothing else, no explanation.\n"
                        "If the input is already a location (city, zip, GPS coords, landmark), return it unchanged.\n\n"
                        f"Input: {raw_input}"
                    ),
                }
            ],
        )
        return message.content[0].text.strip()
    except Exception:
        # If Haiku fails for any reason, fall back to the raw input
        return raw_input
