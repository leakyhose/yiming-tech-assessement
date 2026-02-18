from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, field_validator, model_validator


class WeatherQueryCreate(BaseModel):
    location: str
    start_date: date
    end_date: date

    @model_validator(mode="after")
    def validate_dates(self):
        if self.start_date > self.end_date:
            raise ValueError("start_date must be before or equal to end_date")
        return self


class WeatherQueryUpdate(BaseModel):
    location: str | None = None
    start_date: date | None = None
    end_date: date | None = None


class WeatherQueryResponse(BaseModel):
    id: int
    location: str
    resolved_location: str | None
    latitude: float | None
    longitude: float | None
    start_date: date
    end_date: date
    weather_data: dict[str, Any]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
