from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.weather_query import WeatherQuery
from app.schemas.weather_query import WeatherQueryCreate, WeatherQueryUpdate, WeatherQueryResponse
from app.services.location_interpreter import interpret_location
from app.services.nominatim import resolve_location
from app.services.open_meteo import get_weather_for_range

router = APIRouter(prefix="/queries", tags=["queries"])

MAX_PAST_YEARS = 5
MAX_FUTURE_DAYS = 16


def _validate_date_range(start_date, end_date):
    today = datetime.now(tz=timezone.utc).date()

    if start_date > end_date:
        raise HTTPException(
            status_code=422,
            detail="start_date must be before or equal to end_date",
        )
    if start_date < today - timedelta(days=MAX_PAST_YEARS * 365):
        raise HTTPException(
            status_code=422,
            detail="Date range too far in the past (max 5 years)",
        )
    if end_date > today + timedelta(days=MAX_FUTURE_DAYS):
        raise HTTPException(
            status_code=422,
            detail="Forecast data is only available up to 16 days ahead",
        )


@router.post("/", response_model=WeatherQueryResponse, status_code=201)
async def create_query(body: WeatherQueryCreate, db: AsyncSession = Depends(get_db)):
    _validate_date_range(body.start_date, body.end_date)

    interpreted = await interpret_location(body.location)
    geo = await resolve_location(interpreted)
    weather_data = await get_weather_for_range(
        geo["latitude"], geo["longitude"], body.start_date, body.end_date
    )

    record = WeatherQuery(
        location=body.location,
        resolved_location=geo["resolved_name"],
        latitude=geo["latitude"],
        longitude=geo["longitude"],
        start_date=body.start_date,
        end_date=body.end_date,
        weather_data=weather_data,
    )
    db.add(record)
    await db.flush()
    await db.refresh(record)
    return record


@router.get("/", response_model=list[WeatherQueryResponse])
async def list_queries(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WeatherQuery).order_by(WeatherQuery.created_at.desc()).offset(skip).limit(limit)
    )
    return result.scalars().all()


@router.get("/{query_id}", response_model=WeatherQueryResponse)
async def get_query(query_id: int, db: AsyncSession = Depends(get_db)):
    record = await db.get(WeatherQuery, query_id)
    if not record:
        raise HTTPException(status_code=404, detail="Query not found")
    return record


@router.put("/{query_id}", response_model=WeatherQueryResponse)
async def update_query(
    query_id: int, body: WeatherQueryUpdate, db: AsyncSession = Depends(get_db)
):
    record = await db.get(WeatherQuery, query_id)
    if not record:
        raise HTTPException(status_code=404, detail="Query not found")

    location_changed = body.location is not None and body.location != record.location
    dates_changed = (body.start_date is not None and body.start_date != record.start_date) or (
        body.end_date is not None and body.end_date != record.end_date
    )

    if body.location is not None:
        record.location = body.location
    if body.start_date is not None:
        record.start_date = body.start_date
    if body.end_date is not None:
        record.end_date = body.end_date

    _validate_date_range(record.start_date, record.end_date)

    if location_changed:
        geo = await resolve_location(record.location)
        record.resolved_location = geo["resolved_name"]
        record.latitude = geo["latitude"]
        record.longitude = geo["longitude"]

    if location_changed or dates_changed:
        record.weather_data = await get_weather_for_range(
            float(record.latitude), float(record.longitude), record.start_date, record.end_date
        )

    record.updated_at = datetime.now(tz=timezone.utc)
    await db.flush()
    await db.refresh(record)
    return record


@router.delete("/{query_id}")
async def delete_query(query_id: int, db: AsyncSession = Depends(get_db)):
    record = await db.get(WeatherQuery, query_id)
    if not record:
        raise HTTPException(status_code=404, detail="Query not found")
    await db.delete(record)
    return {"message": "deleted"}
