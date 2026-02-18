"use client";

import { useState } from "react";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import WeatherCard from "@/components/WeatherCard";
import PhotoBanner from "@/components/PhotoBanner";
import MapEmbed from "@/components/MapEmbed";
import YoutubePanel from "@/components/YoutubePanel";
import ErrorMessage from "@/components/ErrorMessage";
import { fetchCurrentWeather, fetchPhotos, fetchMaps, fetchYouTube } from "@/lib/api";

type Weather = Awaited<ReturnType<typeof fetchCurrentWeather>>;
type Photos = { photos: { url: string; alt: string; photographer: string; photographer_url: string }[] };
type MapData = { embed_url: string; resolved_name: string };
type Videos = { videos: { videoId: string; title: string; thumbnail: string; channelTitle: string }[] };

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");

  const [weather, setWeather] = useState<Weather | null>(null);
  const [photos, setPhotos] = useState<Photos | null>(null);
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [videos, setVideos] = useState<Videos | null>(null);

  // Per-section media errors (non-blocking)
  const [mapError, setMapError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [photoError, setPhotoError] = useState(false);

  async function handleSearch(location: string) {
    setLoading(true);
    setError("");
    setWeather(null);
    setPhotos(null);
    setMapData(null);
    setVideos(null);
    setMapError(false);
    setVideoError(false);
    setPhotoError(false);
    setCurrentLocation(location);

    // Phase 1: fetch weather + photos in parallel (critical)
    try {
      const [weatherResult, photosResult] = await Promise.allSettled([
        fetchCurrentWeather(location),
        fetchPhotos(location),
      ]);

      if (weatherResult.status === "rejected") {
        setError(weatherResult.reason?.message || "Weather service is temporarily unavailable. Please try again later.");
        setLoading(false);
        return;
      }

      setWeather(weatherResult.value);
      if (photosResult.status === "fulfilled") {
        setPhotos(photosResult.value as Photos);
      } else {
        setPhotoError(true);
      }
    } catch {
      setError("Weather service is temporarily unavailable. Please try again later.");
      setLoading(false);
      return;
    }

    setLoading(false);

    // Phase 2: fetch map + YouTube in parallel (non-blocking)
    const [mapsResult, videosResult] = await Promise.allSettled([
      fetchMaps(location),
      fetchYouTube(location),
    ]);

    if (mapsResult.status === "fulfilled") {
      setMapData(mapsResult.value as MapData);
    } else {
      setMapError(true);
    }

    if (videosResult.status === "fulfilled") {
      setVideos(videosResult.value as Videos);
    } else {
      setVideoError(true);
    }
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div>
        <h1 className="mb-1 text-3xl font-bold text-slate-800">Weather App</h1>
        <p className="mb-5 text-slate-500">
          Search any city, zip code, GPS coordinates, or landmark for real-time weather.
        </p>
        <SearchBar onSearch={handleSearch} loading={loading} />
      </div>

      {/* Error */}
      {error && <ErrorMessage message={error} />}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-40 rounded-2xl bg-slate-200" />
          <div className="h-64 rounded-2xl bg-slate-200" />
        </div>
      )}

      {/* Results */}
      {weather && !loading && (
        <>
          {/* Photos */}
          {photos && !photoError && <PhotoBanner photos={photos.photos} />}
          {photoError && (
            <p className="text-sm text-slate-400 italic">📷 Photos unavailable for this location.</p>
          )}

          {/* Weather card */}
          <WeatherCard data={weather} />

          {/* Forecast link */}
          <Link
            href={`/forecast?location=${encodeURIComponent(currentLocation)}`}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            See 5-Day Forecast →
          </Link>

          {/* Map */}
          {mapData && !mapError && (
            <MapEmbed embed_url={mapData.embed_url} resolved_name={mapData.resolved_name} />
          )}
          {mapError && (
            <p className="text-sm text-slate-400 italic">🗺️ Map unavailable for this location.</p>
          )}

          {/* YouTube */}
          {videos && !videoError && <YoutubePanel videos={videos.videos} />}
          {videoError && (
            <p className="text-sm text-slate-400 italic">📹 Videos unavailable for this location.</p>
          )}
        </>
      )}
    </div>
  );
}
