"use client";

import { useState, useRef } from "react";
import HistoryTable from "@/components/HistoryTable";
import ExportButtons from "@/components/ExportButtons";
import ErrorMessage from "@/components/ErrorMessage";
import { createQuery } from "@/lib/api";

export default function HistoryPage() {
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const reloadRef = useRef<() => void>(() => {});

  function validate() {
    const errors: Record<string, string> = {};
    if (!location.trim()) errors.location = "Location is required.";
    if (!startDate) errors.startDate = "Start date is required.";
    if (!endDate) errors.endDate = "End date is required.";
    if (startDate && endDate && startDate > endDate) errors.endDate = "End date must be on or after start date.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;
    setSubmitting(true);
    try {
      await createQuery({ location: location.trim(), start_date: startDate, end_date: endDate });
      setLocation("");
      setStartDate("");
      setEndDate("");
      setFieldErrors({});
      reloadRef.current?.();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to create record.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Query History</h1>
        <p className="mt-1 text-sm text-gray-500">Store and manage weather queries for custom date ranges. Export in multiple formats.</p>
      </div>

      <section className="rounded-lg border border-gray-200 p-5">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">Add New Query</h2>
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, zip, coordinates…"
                className={`w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500 ${fieldErrors.location ? "border-red-400" : "border-gray-300 focus:border-blue-500"}`}
              />
              {fieldErrors.location && <p className="mt-1 text-xs text-red-600">{fieldErrors.location}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500 ${fieldErrors.startDate ? "border-red-400" : "border-gray-300 focus:border-blue-500"}`}
              />
              {fieldErrors.startDate && <p className="mt-1 text-xs text-red-600">{fieldErrors.startDate}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500 ${fieldErrors.endDate ? "border-red-400" : "border-gray-300 focus:border-blue-500"}`}
              />
              {fieldErrors.endDate && <p className="mt-1 text-xs text-red-600">{fieldErrors.endDate}</p>}
            </div>
          </div>
          {formError && <ErrorMessage message={formError} />}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Creating…" : "Create Query"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Export Data</h2>
        <ExportButtons />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-gray-700">All Queries</h2>
        <HistoryTable reloadRef={reloadRef} />
      </section>
    </div>
  );
}
