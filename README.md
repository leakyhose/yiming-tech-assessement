# Full-Stack Weather App

**Author:** Yiming Su  

---

## About PM Accelerator

Product Manager Accelerator is the world's first AI-powered career accelerator for product managers. We help PMs land top tech jobs and advance their careers through personalized coaching, real-world projects, and a global community of 30,000+ product professionals.

---

## Assessments Completed

- **Tech Assessment #1 (Frontend)** — Next.js weather app with current weather, 5-day forecast, geolocation, responsive design, and error handling
- **Tech Assessment #2 (Backend)** — FastAPI with PostgreSQL CRUD, date-range weather queries, YouTube/Maps/Unsplash integrations, and data export (JSON, CSV, XML, PDF, Markdown)

---

## How to Run

### Prerequisites
- Node.js 18+, Python 3.11+, PostgreSQL 15+

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate           # Windows (or: source venv/bin/activate on Mac/Linux)
pip install -r requirements.txt
# Create .env with API keys (see below)
alembic upgrade head
uvicorn app.main:app --reload
```
API runs at http://localhost:8000 (Swagger docs at `/docs`)

### Frontend
```bash
cd frontend
npm install
# Create .env.local with NEXT_PUBLIC_API_URL=http://localhost:8000 and Google Maps key
npm run dev
```
App runs at http://localhost:3000

---

## API Keys

| Service | Get it from |
|---|---|
| OpenWeatherMap | https://openweathermap.org/api |
| Google Maps Embed | https://console.cloud.google.com |
| YouTube Data API | https://console.cloud.google.com |
| Unsplash | https://unsplash.com/developers |
| Gemini (location AI) | https://aistudio.google.com/apikey |

Place keys in `backend/.env` and Google Maps key also in `frontend/.env.local`.
