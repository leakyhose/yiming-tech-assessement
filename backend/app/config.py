from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/weatherapp"
    OPENWEATHER_API_KEY: str = ""
    YOUTUBE_API_KEY: str = ""
    GOOGLE_MAPS_API_KEY: str = ""
    UNSPLASH_ACCESS_KEY: str = ""


settings = Settings()
