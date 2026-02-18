from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routers import weather, queries, media, export

app = FastAPI(title="Weather App API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(weather.router, prefix="/api")
app.include_router(queries.router, prefix="/api")
app.include_router(media.router, prefix="/api")
app.include_router(export.router, prefix="/api")


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected server error occurred. Please try again later."},
    )


@app.get("/health")
async def health():
    return {"status": "ok"}
