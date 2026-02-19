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

  return (
    <div className="space-y-6">
      {/* Search */}
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

      {/* Weather results */}
      {weather && !loading && (
        <>
          {photos && !photoError && <PhotoBanner photos={photos.photos} />}

          <WeatherCard data={weather} />

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

      {/* About — shown only before any search */}
      {!weather && !loading && !error && (
        <div className="mt-8 border-t border-gray-100 pt-8 text-center">
          <p className="text-xs text-gray-400 mb-1">Built by Yiming Su</p>
          <h2 className="text-base font-semibold text-gray-800 mb-2">About PM Accelerator</h2>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
            The Product Manager Accelerator Program is designed to support PM professionals through every stage of their careers.
            From students looking for entry-level jobs to Directors looking to take on a leadership role, our program has helped
            hundreds of students fulfill their career aspirations. Our community are ambitious and committed — through our program
            they have learnt, honed, and developed new PM and leadership skills, giving them a strong foundation for their future endeavors.
          </p>
        </div>
      )}
    </div>
  );
}
