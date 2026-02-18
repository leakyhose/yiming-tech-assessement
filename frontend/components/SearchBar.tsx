"use client";

import { useState } from "react";
import ErrorMessage from "./ErrorMessage";

interface Props {
  onSearch: (location: string) => void;
  loading: boolean;
}

export default function SearchBar({ onSearch, loading }: Props) {
  const [input, setInput] = useState("");
  const [geoError, setGeoError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed) onSearch(trimmed);
  }

  function handleGeolocate() {
    setGeoError("");
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser. Please enter a location manually.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = `${pos.coords.latitude},${pos.coords.longitude}`;
        setInput(loc);
        onSearch(loc);
      },
      () => {
        setGeoError("Location access was denied. Please enter a location manually.");
      }
    );
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="City, zip code, coordinates, or landmark…"
          className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Searching…" : "Search"}
        </button>
        {typeof navigator !== "undefined" && "geolocation" in navigator && (
          <button
            type="button"
            onClick={handleGeolocate}
            disabled={loading}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            📍 Use my location
          </button>
        )}
      </form>
      {geoError && <ErrorMessage message={geoError} />}
    </div>
  );
}
