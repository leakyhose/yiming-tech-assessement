"use client";

import { useState } from "react";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import WeatherCard from "@/components/WeatherCard";
import PhotoBanner from "@/components/PhotoBanner";
import MapEmbed from "@/components/MapEmbed";
import YoutubePanel from "@/components/YoutubePanel";
import ErrorMessage from "@/components/ErrorMessage";
import { fetchCurrentWeather, fetchPhotos, fetchMaps, fetchYouTube, createQuery } from "@/lib/api";

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
  const [mapError, setMapError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [photoError, setPhotoError] = useState(false);

  const [saveOpen, setSaveOpen] = useState(false);
  const [saveStart, setSaveStart] = useState("");
  const [saveEnd, setSaveEnd] = useState("");
  const [saveSaving, setSaveSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

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
    setSaveOpen(false);
    setSaveStart("");
    setSaveEnd("");
    setSaveError("");
    setSaveSuccess(false);

    let resolvedName = location;
    try {
      const weatherResult = await fetchCurrentWeather(location);
      setWeather(weatherResult);

      // Use the resolved city name so zip codes / GPS coords produce relevant media.
      resolvedName = weatherResult.weather?.name || location;
      setCurrentLocation(resolvedName);

      const photosResult = await fetchPhotos(resolvedName).catch(() => null);
      if (photosResult) setPhotos(photosResult as Photos);
      else setPhotoError(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Weather service is temporarily unavailable. Please try again later.");
      setLoading(false);
      return;
    }

    setLoading(false);

    const [mapsResult, videosResult] = await Promise.allSettled([
      fetchMaps(resolvedName),
      fetchYouTube(resolvedName),
    ]);

    if (mapsResult.status === "fulfilled") setMapData(mapsResult.value as MapData);
    else setMapError(true);

    if (videosResult.status === "fulfilled") setVideos(videosResult.value as Videos);
    else setVideoError(true);
  }

  async function handleSaveQuery(e: React.FormEvent) {
    e.preventDefault();
    setSaveError("");
    setSaveSaving(true);
    try {
      await createQuery({ location: currentLocation, start_date: saveStart, end_date: saveEnd });
      setSaveSuccess(true);
      setSaveOpen(false);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Failed to save query.");
    } finally {
      setSaveSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="mb-1 text-2xl font-semibold text-gray-900">Weather App</h1>
        <p className="mb-4 text-sm text-gray-500">Search any city, zip code, GPS coordinates, or landmark for real-time weather.</p>
        <div className="mx-auto max-w-xl">
          <SearchBar onSearch={handleSearch} loading={loading} />
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {loading && (
        <div className="space-y-3 animate-pulse">
          <div className="h-36 rounded-lg bg-gray-100" />
          <div className="h-48 rounded-lg bg-gray-100" />
        </div>
      )}

      {weather && !loading && (
        <>
          {photos && !photoError && <PhotoBanner photos={photos.photos} />}

          <WeatherCard data={weather} />

          <div>
            {!saveOpen && !saveSuccess && (
              <button
                onClick={() => setSaveOpen(true)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Save to Queries
              </button>
            )}
            {saveSuccess && (
              <p className="text-sm text-green-600">Saved. View it in <Link href="/history" className="underline">Saved Queries</Link>.</p>
            )}
            {saveOpen && (
              <form onSubmit={handleSaveQuery} className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 p-4">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Start Date</label>
                  <input
                    type="date"
                    required
                    value={saveStart}
                    onChange={(e) => setSaveStart(e.target.value)}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">End Date</label>
                  <input
                    type="date"
                    required
                    value={saveEnd}
                    onChange={(e) => setSaveEnd(e.target.value)}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={saveSaving}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {saveSaving ? "Saving…" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSaveOpen(false); setSaveError(""); }}
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
                {saveError && <p className="w-full text-xs text-red-600">{saveError}</p>}
              </form>
            )}
          </div>

          <Link
            href={`/forecast?location=${encodeURIComponent(currentLocation)}`}
            className="inline-block rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            See 5-Day Forecast →
          </Link>

          {mapData && !mapError && <MapEmbed embed_url={mapData.embed_url} resolved_name={mapData.resolved_name} />}
          {videos && !videoError && <YoutubePanel videos={videos.videos} />}
        </>
      )}

      {!weather && !loading && !error && (
        <div className="mt-8 border-t border-gray-100 pt-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-1">
            <p className="text-xs text-gray-400">Built by Yiming Su</p>
            <a href="https://www.linkedin.com/in/yiming-su-b0115418b/" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors">LinkedIn</a>
            <a href="https://github.com/leakyhose" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors">GitHub</a>
          </div>
          <h2 className="text-base font-semibold text-gray-800 mb-2">About PM Accelerator</h2>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
            The Product Manager Accelerator Program is designed to support PM professionals through every stage of their careers.
            From students looking for entry-level jobs to Directors looking to take on a leadership role, our program has helped
            hundreds of students fulfill their career aspirations. Our community are ambitious and committed; through our program
            they have learnt, honed, and developed new PM and leadership skills, giving them a strong foundation for their future endeavors.
          </p>
        </div>
      )}
    </div>
  );
}
