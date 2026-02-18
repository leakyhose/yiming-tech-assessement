from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import weather

app = FastAPI(title="Weather App API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(weather.router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok"}
