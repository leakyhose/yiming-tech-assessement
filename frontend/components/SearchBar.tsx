"use client";

import { useState, useEffect } from "react";
import ErrorMessage from "./ErrorMessage";

interface Props {
  onSearch: (location: string) => void;
  loading: boolean;
}

export default function SearchBar({ onSearch, loading }: Props) {
  const [input, setInput] = useState("");
  const [geoError, setGeoError] = useState("");
  const [geoSupported, setGeoSupported] = useState(false);

  useEffect(() => {
    setGeoSupported("geolocation" in navigator);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed) onSearch(trimmed);
  }

  function handleGeolocate() {
    setGeoError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = `${pos.coords.latitude.toFixed(5)},${pos.coords.longitude.toFixed(5)}`;
        setInput(loc);
        onSearch(loc);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError("Location access was denied. Please enter a location manually.");
        } else {
          setGeoError("Could not retrieve your location. Please enter a location manually.");
        }
      },
      { timeout: 10000 }
    );
  }

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="City, zip, coordinates, or try &quot;weather near the Eiffel Tower&quot;…"
          className="flex-1 rounded-md border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Searching…" : "Search"}
        </button>
        {geoSupported && (
          <button
            type="button"
            onClick={handleGeolocate}
            disabled={loading}
            className="rounded-md border border-gray-300 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            My Location
          </button>
        )}
      </form>
      {geoError && <ErrorMessage message={geoError} />}
    </div>
  );
}
