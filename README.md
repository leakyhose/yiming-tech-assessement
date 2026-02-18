# Full-Stack Weather App

**Author:** Yiming Su

## About PM Accelerator

Product Manager Accelerator is the world's first AI-powered career accelerator for product managers. We help PMs land top tech jobs and advance their careers through personalized coaching, real-world projects, and a global community of 30,000+ product professionals. Our programs combine AI-driven learning with mentorship from senior PMs at companies like Google, Meta, Amazon, and more.

## Assessments Completed

- **Tech Assessment #1** — Frontend (Next.js, current weather, 5-day forecast, geolocation, responsive design)
- **Tech Assessment #2** — Backend (FastAPI, PostgreSQL CRUD, date-range weather, YouTube/Maps/Unsplash integrations, multi-format export)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router, TypeScript, Tailwind CSS) |
| Backend | Python 3.11+ / FastAPI |
| Database | PostgreSQL + SQLAlchemy (async) + Alembic |
| Weather (current/forecast) | OpenWeatherMap API |
| Weather (date range) | Open-Meteo (free, no key) |
| Geocoding | Nominatim (OpenStreetMap, free, no key) |
| Maps | Google Maps Embed API |
| Videos | YouTube Data API v3 |
| Photos | Unsplash API |

## Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL 15+

## Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env              # Fill in your API keys
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local  # Fill in your keys
npm run dev
```

The app will be available at http://localhost:3000. The API runs at http://localhost:8000.

## API Keys Required

| Service | Where to get it | Cost |
|---|---|---|
| OpenWeatherMap | https://openweathermap.org/api | Free tier available |
| Google Maps + YouTube | https://console.cloud.google.com | Free tier available |
| Unsplash | https://unsplash.com/developers | Free tier available |
| Nominatim (geocoding) | No key needed | Free, open-source |
| Open-Meteo (date range weather) | No key needed | Free, open-source |

## Features

### Tech Assessment #1 (Frontend)
- Search weather by city name, zip code, GPS coordinates, or landmark
- Detect user's current location via browser geolocation
- Current weather display with temperature, humidity, wind, visibility, sunrise/sunset
- 5-day forecast with daily high/low, icons, and descriptions
- Responsive design across mobile, tablet, and desktop
- Error handling for location not found, API failures, geolocation denial
- Location photos via Unsplash
- Google Maps embed
- YouTube travel videos for the location

### Tech Assessment #2 (Backend)
- RESTful API built with FastAPI (auto-generated OpenAPI docs at `/docs`)
- PostgreSQL database with full CRUD for weather queries
- Date-range weather data (past and future) via Open-Meteo
- Input validation: date ranges, location existence (fuzzy matching via Nominatim)
- Data export in 5 formats: JSON, CSV, XML, PDF, Markdown
- YouTube, Google Maps, and Unsplash API integrations
