"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ForecastGrid from "@/components/ForecastGrid";
import ErrorMessage from "@/components/ErrorMessage";
import { fetchForecast } from "@/lib/api";

interface DayForecast {
  date: string;
  temp_min: number;
  temp_max: number;
  humidity: number;
  icon: string;
  description: string;
}

function ForecastContent() {
  const searchParams = useSearchParams();
  const location = searchParams.get("location") || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [daily, setDaily] = useState<DayForecast[]>([]);
  const [resolvedName, setResolvedName] = useState("");

  useEffect(() => {
    if (!location) return;

    setLoading(true);
    setError("");
    fetchForecast(location)
      .then((data) => {
        setResolvedName(data.resolved_location || location);
        setDaily(data.forecast?.daily || []);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [location]);

  if (!location) {
    return (
      <div className="space-y-4">
        <ErrorMessage message="No location specified. Please search from the home page." />
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
          ← Back to search
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">5-Day Forecast</h1>
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          ← Back to search
        </Link>
      </div>

      {error && <ErrorMessage message={error} />}

      {loading && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-slate-200" />
          ))}
        </div>
      )}

      {!loading && !error && (
        <ForecastGrid daily={daily} locationName={resolvedName} />
      )}
    </div>
  );
}

export default function ForecastPage() {
  return (
    <Suspense fallback={<div className="animate-pulse h-44 rounded-2xl bg-slate-200" />}>
      <ForecastContent />
    </Suspense>
  );
}
