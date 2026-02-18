import httpx
from fastapi import HTTPException

from app.config import settings

YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"


async def search_videos(location: str) -> list:
    """
    Search YouTube for travel/weather videos about the given location.
    Returns list of {videoId, title, thumbnail, channelTitle}.
    """
    params = {
        "part": "snippet",
        "q": f"{location} travel weather",
        "type": "video",
        "maxResults": 3,
        "key": settings.YOUTUBE_API_KEY,
    }
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.get(YOUTUBE_SEARCH_URL, params=params)
            resp.raise_for_status()
            data = resp.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=502,
                detail=f"YouTube API error: {e.response.text}",
            )
        except httpx.RequestError as e:
            raise HTTPException(status_code=502, detail=f"YouTube API unreachable: {e}")

    items = data.get("items", [])
    return [
        {
            "videoId": item["id"]["videoId"],
            "title": item["snippet"]["title"],
            "thumbnail": item["snippet"]["thumbnails"]["high"]["url"],
            "channelTitle": item["snippet"]["channelTitle"],
        }
        for item in items
        if item.get("id", {}).get("videoId")
    ]
