"use client";

import { useEffect, useState, useRef, MutableRefObject } from "react";
import ErrorMessage from "./ErrorMessage";
import { listQueries, deleteQuery, updateQuery, WeatherQueryRecord, WeatherQueryUpdate } from "@/lib/api";

const PAGE_SIZE = 20;

interface Props {
  reloadRef?: MutableRefObject<() => void>;
}

export default function HistoryTable({ reloadRef }: Props) {
  const [records, setRecords] = useState<WeatherQueryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Editing state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<WeatherQueryUpdate>({});
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Expanded row
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Expose reload function to parent via ref
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  });
  useEffect(() => {
    if (reloadRef) reloadRef.current = () => loadRef.current(0, false);
  }, [reloadRef]);

  async function load(newSkip = 0, append = false) {
    setLoading(true);
    setError("");
    try {
      const data = await listQueries(newSkip, PAGE_SIZE);
      setRecords((prev) => (append ? [...prev, ...data] : data));
      setHasMore(data.length === PAGE_SIZE);
      setSkip(newSkip);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load records.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(0);
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("Delete this record?")) return;
    try {
      await deleteQuery(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    }
  }

  function startEdit(record: WeatherQueryRecord) {
    setEditingId(record.id);
    setEditForm({ location: record.location, start_date: record.start_date, end_date: record.end_date });
    setEditError("");
  }

  async function handleSaveEdit(id: number) {
    // Client-side validation
    if (editForm.start_date && editForm.end_date && editForm.start_date > editForm.end_date) {
      setEditError("Start date must be before or equal to end date.");
      return;
    }
    setEditLoading(true);
    setEditError("");
    try {
      const updated = await updateQuery(id, editForm);
      setRecords((prev) => prev.map((r) => (r.id === id ? updated : r)));
      setEditingId(null);
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setEditLoading(false);
    }
  }

  if (loading && records.length === 0) {
    return <div className="animate-pulse h-32 rounded-2xl bg-slate-200" />;
  }

  return (
    <div className="space-y-4">
      {error && <ErrorMessage message={error} />}

      {records.length === 0 && !loading && (
        <p className="text-slate-500 text-sm italic">No records yet. Create one above.</p>
      )}

      {/* Desktop table */}
      {records.length > 0 && (
        <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                {["ID", "Location", "Resolved", "Date Range", "Created", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {records.map((r) => (
                <>
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-400">{r.id}</td>

                    {/* Location cell — editable */}
                    <td className="px-4 py-3">
                      {editingId === r.id ? (
                        <input
                          value={editForm.location || ""}
                          onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))}
                          className="w-full rounded border border-slate-300 px-2 py-1 text-sm outline-none focus:border-blue-400"
                        />
                      ) : (
                        <span className="font-medium text-slate-800">{r.location}</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-slate-500 max-w-[180px] truncate">
                      {r.resolved_location || "—"}
                    </td>

                    {/* Date range — editable */}
                    <td className="px-4 py-3">
                      {editingId === r.id ? (
                        <div className="flex flex-col gap-1">
                          <input
                            type="date"
                            value={editForm.start_date || ""}
                            onChange={(e) => setEditForm((f) => ({ ...f, start_date: e.target.value }))}
                            className="rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-blue-400"
                          />
                          <input
                            type="date"
                            value={editForm.end_date || ""}
                            onChange={(e) => setEditForm((f) => ({ ...f, end_date: e.target.value }))}
                            className="rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-blue-400"
                          />
                        </div>
                      ) : (
                        <span className="text-slate-600">{r.start_date} — {r.end_date}</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-slate-400">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-3">
                      {editingId === r.id ? (
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleSaveEdit(r.id)}
                            disabled={editLoading}
                            className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            {editLoading ? "Saving…" : "Save"}
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="rounded border border-slate-300 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                          {editError && <p className="text-xs text-red-600">{editError}</p>}
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <button
                            onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                            className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
                          >
                            {expandedId === r.id ? "Hide" : "View"}
                          </button>
                          <button
                            onClick={() => startEdit(r)}
                            className="rounded border border-blue-200 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>

                  {/* Expanded weather data row */}
                  {expandedId === r.id && (
                    <tr key={`${r.id}-expanded`}>
                      <td colSpan={6} className="bg-slate-50 px-4 py-3">
                        <pre className="overflow-x-auto rounded bg-slate-100 p-3 text-xs text-slate-700 max-h-48">
                          {JSON.stringify(r.weather_data, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile card stack */}
      {records.length > 0 && (
        <div className="space-y-3 md:hidden">
          {records.map((r) => (
            <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{r.location}</p>
                  <p className="text-xs text-slate-500">{r.resolved_location || "—"}</p>
                  <p className="text-xs text-slate-400 mt-1">{r.start_date} — {r.end_date}</p>
                </div>
                <p className="text-xs text-slate-400">#{r.id}</p>
              </div>

              {editingId === r.id ? (
                <div className="mt-3 space-y-2">
                  <input
                    value={editForm.location || ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))}
                    placeholder="Location"
                    className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                  />
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={editForm.start_date || ""}
                      onChange={(e) => setEditForm((f) => ({ ...f, start_date: e.target.value }))}
                      className="flex-1 rounded border border-slate-300 px-2 py-1 text-xs"
                    />
                    <input
                      type="date"
                      value={editForm.end_date || ""}
                      onChange={(e) => setEditForm((f) => ({ ...f, end_date: e.target.value }))}
                      className="flex-1 rounded border border-slate-300 px-2 py-1 text-xs"
                    />
                  </div>
                  {editError && <p className="text-xs text-red-600">{editError}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(r.id)}
                      disabled={editLoading}
                      className="flex-1 rounded bg-blue-600 py-1.5 text-xs text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {editLoading ? "Saving…" : "Save"}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex-1 rounded border border-slate-300 py-1.5 text-xs text-slate-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                    className="flex-1 rounded border border-slate-200 py-1.5 text-xs text-slate-600"
                  >
                    {expandedId === r.id ? "Hide" : "View"}
                  </button>
                  <button
                    onClick={() => startEdit(r)}
                    className="flex-1 rounded border border-blue-200 py-1.5 text-xs text-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="flex-1 rounded border border-red-200 py-1.5 text-xs text-red-600"
                  >
                    Delete
                  </button>
                </div>
              )}

              {expandedId === r.id && (
                <pre className="mt-3 overflow-x-auto rounded bg-slate-100 p-2 text-xs text-slate-700 max-h-40">
                  {JSON.stringify(r.weather_data, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <button
          onClick={() => load(skip + PAGE_SIZE, true)}
          disabled={loading}
          className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          {loading ? "Loading…" : "Load more"}
        </button>
      )}
    </div>
  );
}
