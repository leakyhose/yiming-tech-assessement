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

  // Used to tell HistoryTable to reload
  const reloadRef = useRef<() => void>(() => {});

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!location.trim()) errors.location = "Location is required.";
    if (!startDate) errors.startDate = "Start date is required.";
    if (!endDate) errors.endDate = "End date is required.";
    if (startDate && endDate && startDate > endDate) {
      errors.endDate = "End date must be on or after start date.";
    }
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
      // Trigger table reload
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
        <h1 className="text-2xl font-bold text-slate-800">Weather Query History</h1>
        <p className="mt-1 text-sm text-slate-500">
          Create, view, edit, and delete stored weather queries. Export data in multiple formats.
        </p>
      </div>

      {/* ── Create Query Form ── */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-slate-700">Add New Query</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Location */}
            <div className="sm:col-span-1">
              <label className="mb-1 block text-xs font-medium text-slate-600">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, zip, coordinates…"
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 ${fieldErrors.location ? "border-red-400 focus:border-red-400" : "border-slate-300 focus:border-blue-500"}`}
              />
              {fieldErrors.location && <p className="mt-1 text-xs text-red-600">{fieldErrors.location}</p>}
            </div>

            {/* Start date */}
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 ${fieldErrors.startDate ? "border-red-400" : "border-slate-300 focus:border-blue-500"}`}
              />
              {fieldErrors.startDate && <p className="mt-1 text-xs text-red-600">{fieldErrors.startDate}</p>}
            </div>

            {/* End date */}
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 ${fieldErrors.endDate ? "border-red-400" : "border-slate-300 focus:border-blue-500"}`}
              />
              {fieldErrors.endDate && <p className="mt-1 text-xs text-red-600">{fieldErrors.endDate}</p>}
            </div>
          </div>

          {formError && <ErrorMessage message={formError} />}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Creating…" : "Create Query"}
          </button>
        </form>
      </section>

      {/* ── Export ── */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-slate-700">Export Data</h2>
        <ExportButtons />
      </section>

      {/* ── History Table ── */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-slate-700">All Queries</h2>
        <HistoryTable reloadRef={reloadRef} />
      </section>
    </div>
  );
}
