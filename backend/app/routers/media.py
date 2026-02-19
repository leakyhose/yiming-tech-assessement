from fastapi import APIRouter, Query

from app.services.location_interpreter import interpret_location
from app.services.youtube import search_videos
from app.services.maps import get_map_data
from app.services.unsplash import get_photos

router = APIRouter(prefix="/media", tags=["media"])


@router.get("/youtube")
async def youtube_videos(location: str = Query(..., description="Location to search videos for")):
    geo = await interpret_location(location)
    videos = await search_videos(geo["resolved_name"])
    return {"resolved_location": geo["resolved_name"], "videos": videos}


@router.get("/maps")
async def maps_data(location: str = Query(..., description="Location to get map data for")):
    geo = await interpret_location(location)
    return await get_map_data(geo["resolved_name"])


@router.get("/photos")
async def unsplash_photos(location: str = Query(..., description="Location to get photos for")):
    geo = await interpret_location(location)
    photos = await get_photos(geo["resolved_name"])
    return {"resolved_location": geo["resolved_name"], "photos": photos}
