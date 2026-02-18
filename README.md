# Full-Stack Weather App

**Author:** Yiming Su
**Date:** February 2026

---

## About PM Accelerator

Product Manager Accelerator is the world's first AI-powered career accelerator for product managers. We help PMs land top tech jobs and advance their careers through personalized coaching, real-world projects, and a global community of 30,000+ product professionals. Our programs combine AI-driven learning with mentorship from senior PMs at companies like Google, Meta, Amazon, and more.

---

## Assessments Completed

- **Tech Assessment #1** — Frontend (Next.js, current weather, 5-day forecast, geolocation, responsive design, error handling)
- **Tech Assessment #2** — Backend (FastAPI, PostgreSQL CRUD, date-range weather, YouTube/Maps/Unsplash integrations, multi-format data export)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router, TypeScript, Tailwind CSS) |
| Backend | Python / FastAPI |
| Database | PostgreSQL + SQLAlchemy (async) + Alembic migrations |
| Weather — current/forecast | OpenWeatherMap API |
| Weather — date range | Open-Meteo (free, no key required) |
| Geocoding / fuzzy location | Nominatim (OpenStreetMap, free, no key required) |
| Maps | Google Maps Embed API |
| Videos | YouTube Data API v3 |
| Photos | Unsplash API |

---

## Prerequisites

- **Node.js** 18+
- **Python** 3.11+
- **PostgreSQL** 15+

---

## Setup

### 1. Clone

```bash
git clone <your-repo-url>
cd yiming-tech-assessement
```

### 2. Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate       # macOS/Linux
# venv\Scripts\activate        # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and fill in your API keys (see "API Keys" section below)

# Run database migrations
alembic upgrade head

# Start the API server
uvicorn app.main:app --reload --port 8000
```

The API will be available at **http://localhost:8000**.
Interactive docs (Swagger UI) are at **http://localhost:8000/docs**.

### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local and fill in your keys

# Start the dev server
npm run dev
```

The app will be available at **http://localhost:3000**.

---

## API Keys Required

| Service | Where to get it | Key location |
|---|---|---|
| OpenWeatherMap | https://openweathermap.org/api (free tier) | `backend/.env` → `OPENWEATHER_API_KEY` |
| Google Maps Embed | https://console.cloud.google.com → Maps Embed API | `backend/.env` + `frontend/.env.local` |
| YouTube Data API v3 | https://console.cloud.google.com → YouTube Data API v3 | `backend/.env` → `YOUTUBE_API_KEY` |
| Unsplash | https://unsplash.com/developers (free tier) | `backend/.env` → `UNSPLASH_ACCESS_KEY` |
| Nominatim (geocoding) | No key needed — open-source | — |
| Open-Meteo (date-range weather) | No key needed — open-source | — |

> **Note:** Google Maps API key is needed in both `backend/.env` (for the embed URL builder) and `frontend/.env.local` (for the `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` variable used by the browser).

---

## API Endpoints

The FastAPI backend exposes the following REST endpoints (all prefixed with `/api`):

### Weather

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/weather/current?location=...` | Current weather for a location |
| `GET` | `/api/weather/forecast?location=...` | 5-day forecast (collapsed to daily) |

### CRUD — Stored Queries

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/queries/` | Create: validate location + date range, fetch & store weather |
| `GET` | `/api/queries/` | Read: paginated list of all queries (`skip`, `limit` params) |
| `GET` | `/api/queries/{id}` | Read: single query by ID |
| `PUT` | `/api/queries/{id}` | Update: re-geocodes and re-fetches weather on change |
| `DELETE` | `/api/queries/{id}` | Delete a record |

### Media

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/media/youtube?location=...` | YouTube travel/weather videos |
| `GET` | `/api/media/maps?location=...` | Google Maps embed URL + coordinates |
| `GET` | `/api/media/photos?location=...` | Unsplash location photos |

### Export

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/export/?format=json` | Export all DB records as JSON |
| `GET` | `/api/export/?format=csv` | Export as CSV |
| `GET` | `/api/export/?format=xml` | Export as XML |
| `GET` | `/api/export/?format=pdf` | Export as PDF |
| `GET` | `/api/export/?format=markdown` | Export as Markdown |

---

## Feature List

### Tech Assessment #1 — Frontend

- **Location search** — city name, zip/postal code, GPS coordinates (`lat,lon`), or landmark (via Nominatim fuzzy matching)
- **Geolocation** — "My location" button uses browser `navigator.geolocation`; hidden if unsupported
- **Current weather card** — temperature, feels-like, humidity, wind speed, visibility, pressure, sunrise/sunset, weather icon
- **5-day forecast** — daily high/low, humidity, weather icon, description; responsive grid (1 → 2 → 3 → 5 columns)
- **Location photos** — 3 Unsplash photos with photographer credit as required by Unsplash guidelines
- **Google Maps embed** — iframe for the resolved location
- **YouTube videos** — 3 travel/weather video thumbnails linking to YouTube
- **Responsive design** — mobile (375 px), tablet (768 px), desktop (1280 px); hamburger nav on mobile
- **Error handling**:
  - Location not found → clear user message
  - API quota exceeded / service down → graceful error display
  - Geolocation denied → message prompting manual entry
  - Geolocation unsupported → button hidden
  - Media API failures (YouTube / Maps / Unsplash) → silently hidden, weather still shown
  - Network unreachable → "Unable to connect to the server" message
  - 404 page and global error boundary

### Tech Assessment #2 — Backend

- **FastAPI** with auto-generated Swagger UI at `/docs`
- **PostgreSQL** with async SQLAlchemy + Alembic migrations
- **CRUD** on `weather_queries` table:
  - **CREATE** — validates date range (max 5 years past, max 16 days future), validates location via Nominatim, fetches and stores Open-Meteo data
  - **READ** — paginated list and single-record endpoints
  - **UPDATE** — partial update; re-geocodes and re-fetches weather when location or dates change
  - **DELETE** — removes record
- **Date-range weather** via Open-Meteo (historical archive + forecast; split-and-merge for ranges spanning today)
- **Media integrations** — YouTube, Google Maps, Unsplash
- **Data export** — JSON, CSV, XML, PDF (reportlab), Markdown
- **Global error handler** — unhandled exceptions return structured JSON

---

## Project Structure

```
yiming-tech-assessement/
├── frontend/               # Next.js app
│   ├── app/
│   │   ├── layout.tsx      # Root layout with Navbar + footer
│   │   ├── page.tsx        # Home: search + current weather + media
│   │   ├── forecast/       # 5-day forecast page
│   │   ├── history/        # CRUD history page
│   │   ├── error.tsx       # Global error boundary
│   │   └── not-found.tsx   # 404 page
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── SearchBar.tsx
│   │   ├── WeatherCard.tsx
│   │   ├── ForecastGrid.tsx
│   │   ├── PhotoBanner.tsx
│   │   ├── MapEmbed.tsx
│   │   ├── YoutubePanel.tsx
│   │   ├── HistoryTable.tsx
│   │   ├── ExportButtons.tsx
│   │   └── ErrorMessage.tsx
│   └── lib/
│       └── api.ts          # Typed axios wrappers for all backend endpoints
│
└── backend/                # FastAPI app
    ├── app/
    │   ├── main.py
    │   ├── config.py
    │   ├── database.py
    │   ├── models/
    │   ├── schemas/
    │   ├── routers/        # weather, queries, media, export
    │   └── services/       # nominatim, openweather, open_meteo, youtube, maps, unsplash, exporter
    ├── alembic/
    ├── alembic.ini
    └── requirements.txt
```
