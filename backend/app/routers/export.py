from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.weather_query import WeatherQuery
from app.services.exporter import to_json, to_csv, to_xml, to_pdf, to_markdown

router = APIRouter(prefix="/export", tags=["export"])

EXPORTERS = {
    "json": (to_json, "weather_queries.json"),
    "csv": (to_csv, "weather_queries.csv"),
    "xml": (to_xml, "weather_queries.xml"),
    "pdf": (to_pdf, "weather_queries.pdf"),
    "markdown": (to_markdown, "weather_queries.md"),
}


@router.get("/")
async def export_data(
    format: str = Query(..., description="Export format: json | csv | xml | pdf | markdown"),
    db: AsyncSession = Depends(get_db),
):
    if format not in EXPORTERS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format '{format}'. Choose from: {', '.join(EXPORTERS)}",
        )

    result = await db.execute(select(WeatherQuery).order_by(WeatherQuery.created_at.desc()))
    records = result.scalars().all()

    # Serialize ORM objects to plain dicts
    record_dicts = [
        {
            "id": r.id,
            "location": r.location,
            "resolved_location": r.resolved_location,
            "latitude": float(r.latitude) if r.latitude is not None else None,
            "longitude": float(r.longitude) if r.longitude is not None else None,
            "start_date": r.start_date,
            "end_date": r.end_date,
            "weather_data": r.weather_data,
            "created_at": r.created_at,
            "updated_at": r.updated_at,
        }
        for r in records
    ]

    exporter_fn, filename = EXPORTERS[format]
    try:
        content, media_type = exporter_fn(record_dicts)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {e}")

    return Response(
        content=content,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
