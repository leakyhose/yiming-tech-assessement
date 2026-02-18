from fastapi import APIRouter, Query

from app.services.youtube import search_videos
from app.services.maps import get_map_data
from app.services.unsplash import get_photos

router = APIRouter(prefix="/media", tags=["media"])


@router.get("/youtube")
async def youtube_videos(location: str = Query(..., description="Location to search videos for")):
    videos = await search_videos(location)
    return {"videos": videos}


@router.get("/maps")
async def maps_data(location: str = Query(..., description="Location to get map data for")):
    return await get_map_data(location)


@router.get("/photos")
async def unsplash_photos(location: str = Query(..., description="Location to get photos for")):
    photos = await get_photos(location)
    return {"photos": photos}
