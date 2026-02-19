import axios, { AxiosError } from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000",
});

function humanizeError(err: unknown): string {
  if (err instanceof AxiosError) {
    const detail = err.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) return detail.map((d) => d.msg).join("; ");
    if (err.response?.status === 404) return "Location not found. Try a city name, zip code, or coordinates.";
    if (err.response?.status === 502) return "Weather data is temporarily unavailable. Please try again later.";
    if (!err.response) return "Unable to connect to the server. Please try again.";
  }
  return "An unexpected error occurred. Please try again.";
}

function wrap<T>(fn: () => Promise<T>): Promise<T> {
  return fn().catch((err) => {
    throw new Error(humanizeError(err));
  });
}

export interface WeatherQueryCreate {
  location: string;
  start_date: string;
  end_date: string;
}

export interface WeatherQueryUpdate {
  location?: string;
  start_date?: string;
  end_date?: string;
}

export interface WeatherQueryRecord {
  id: number;
  location: string;
  resolved_location: string | null;
  latitude: number | null;
  longitude: number | null;
  start_date: string;
  end_date: string;
  weather_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const fetchCurrentWeather = (location: string) =>
  wrap(() => api.get("/api/weather/current", { params: { location } }).then((r) => r.data));

export const fetchForecast = (location: string) =>
  wrap(() => api.get("/api/weather/forecast", { params: { location } }).then((r) => r.data));

export const fetchYouTube = (location: string) =>
  wrap(() => api.get("/api/media/youtube", { params: { location } }).then((r) => r.data));

export const fetchMaps = (location: string) =>
  wrap(() => api.get("/api/media/maps", { params: { location } }).then((r) => r.data));

export const fetchPhotos = (location: string) =>
  wrap(() => api.get("/api/media/photos", { params: { location } }).then((r) => r.data));

export const createQuery = (body: WeatherQueryCreate): Promise<WeatherQueryRecord> =>
  wrap(() => api.post("/api/queries/", body).then((r) => r.data));

export const listQueries = (skip = 0, limit = 20): Promise<WeatherQueryRecord[]> =>
  wrap(() => api.get("/api/queries/", { params: { skip, limit } }).then((r) => r.data));

export const getQuery = (id: number): Promise<WeatherQueryRecord> =>
  wrap(() => api.get(`/api/queries/${id}`).then((r) => r.data));

export const updateQuery = (id: number, body: WeatherQueryUpdate): Promise<WeatherQueryRecord> =>
  wrap(() => api.put(`/api/queries/${id}`, body).then((r) => r.data));

export const deleteQuery = (id: number): Promise<void> =>
  wrap(() => api.delete(`/api/queries/${id}`).then((r) => r.data));

export const exportData = (format: string) =>
  wrap(() =>
    api
      .get("/api/export/", { params: { format }, responseType: "blob" })
      .then((r) => ({ blob: r.data as Blob, headers: r.headers }))
  );
