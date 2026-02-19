"use client";

import { useEffect, useState, useRef, MutableRefObject } from "react";
import ErrorMessage from "./ErrorMessage";
import { listQueries, deleteQuery, updateQuery, WeatherQueryRecord, WeatherQueryUpdate } from "@/lib/api";

const PAGE_SIZE = 20;
const RETRY_ATTEMPTS = 4;
const RETRY_DELAY_MS = 2000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function HistoryTable({ reloadRef }: { reloadRef?: MutableRefObject<() => void> }) {
  const [records, setRecords] = useState<WeatherQueryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<WeatherQueryUpdate>({});
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const loadRef = useRef(load);
  useEffect(() => { loadRef.current = load; });
  useEffect(() => {
    if (reloadRef) reloadRef.current = () => loadRef.current(0, false);
  }, [reloadRef]);

  async function load(newSkip = 0, append = false) {
    setLoading(true);
    setError("");

    let lastError: unknown;
    for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
      try {
        const data = await listQueries(newSkip, PAGE_SIZE);
        setRecords((prev) => (append ? [...prev, ...data] : data));
        setHasMore(data.length === PAGE_SIZE);
        setSkip(newSkip);
        setConnecting(false);
        setLoading(false);
        return;
      } catch (err) {
        lastError = err;
        if (attempt < RETRY_ATTEMPTS) {
          setConnecting(true);
          await sleep(RETRY_DELAY_MS);
        }
      }
    }

    setConnecting(false);
    setLoading(false);
    setError(lastError instanceof Error ? lastError.message : "Failed to load records.");
  }

  useEffect(() => { load(0); }, []);

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
    return (
      <div className="rounded-lg border border-gray-200 p-6 text-center">
        <div className="h-2 w-24 mx-auto rounded bg-gray-200 animate-pulse mb-3" />
        <p className="text-sm text-gray-400">
          {connecting ? "Connecting to database…" : "Loading…"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && <ErrorMessage message={error} />}

      {records.length === 0 && !loading && (
        <p className="text-sm text-gray-400">No records yet. Create one above.</p>
      )}

      {records.length > 0 && (
        <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 border-b border-gray-200">
              <tr>
                {["ID", "Location", "Resolved", "Date Range", "Created", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {records.map((r) => (
                <>
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400 tabular-nums">{r.id}</td>
                    <td className="px-4 py-3">
                      {editingId === r.id ? (
                        <input
                          value={editForm.location || ""}
                          onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))}
                          className="w-full rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:border-blue-400"
                        />
                      ) : (
                        <span className="font-medium text-gray-800">{r.location}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate">{r.resolved_location || "N/A"}</td>
                    <td className="px-4 py-3 tabular-nums">
                      {editingId === r.id ? (
                        <div className="flex flex-col gap-1">
                          <input type="date" value={editForm.start_date || ""} onChange={(e) => setEditForm((f) => ({ ...f, start_date: e.target.value }))} className="rounded border border-gray-300 px-2 py-1 text-xs outline-none focus:border-blue-400" />
                          <input type="date" value={editForm.end_date || ""} onChange={(e) => setEditForm((f) => ({ ...f, end_date: e.target.value }))} className="rounded border border-gray-300 px-2 py-1 text-xs outline-none focus:border-blue-400" />
                        </div>
                      ) : (
                        <span className="text-gray-600">{r.start_date} to {r.end_date}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {editingId === r.id ? (
                        <div className="flex flex-col gap-1">
                          <button onClick={() => handleSaveEdit(r.id)} disabled={editLoading} className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700 disabled:opacity-50">
                            {editLoading ? "Saving…" : "Save"}
                          </button>
                          <button onClick={() => setEditingId(null)} className="rounded border border-gray-300 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50">Cancel</button>
                          {editError && <p className="text-xs text-red-600">{editError}</p>}
                        </div>
                      ) : (
                        <div className="flex gap-2 text-xs">
                          <button onClick={() => setExpandedId(expandedId === r.id ? null : r.id)} className="text-gray-500 hover:text-gray-800">{expandedId === r.id ? "Hide" : "View"}</button>
                          <button onClick={() => startEdit(r)} className="text-blue-600 hover:text-blue-800">Edit</button>
                          <button onClick={() => handleDelete(r.id)} className="text-red-500 hover:text-red-700">Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                  {expandedId === r.id && (
                    <tr key={`${r.id}-exp`}>
                      <td colSpan={6} className="bg-gray-50 px-4 py-3">
                        <pre className="overflow-x-auto rounded bg-gray-100 p-3 text-xs text-gray-600 max-h-48">
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

      {records.length > 0 && (
        <div className="space-y-2 md:hidden">
          {records.map((r) => (
            <div key={r.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium text-gray-800">{r.location}</p>
                  <p className="text-xs text-gray-500">{r.resolved_location || "N/A"}</p>
                  <p className="text-xs text-gray-400">{r.start_date} to {r.end_date}</p>
                </div>
                <p className="text-xs text-gray-300">#{r.id}</p>
              </div>
              {editingId === r.id ? (
                <div className="mt-3 space-y-2">
                  <input value={editForm.location || ""} onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))} className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm outline-none" />
                  <div className="flex gap-2">
                    <input type="date" value={editForm.start_date || ""} onChange={(e) => setEditForm((f) => ({ ...f, start_date: e.target.value }))} className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs outline-none" />
                    <input type="date" value={editForm.end_date || ""} onChange={(e) => setEditForm((f) => ({ ...f, end_date: e.target.value }))} className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs outline-none" />
                  </div>
                  {editError && <p className="text-xs text-red-600">{editError}</p>}
                  <div className="flex gap-2">
                    <button onClick={() => handleSaveEdit(r.id)} disabled={editLoading} className="flex-1 rounded bg-blue-600 py-1.5 text-xs text-white disabled:opacity-50">{editLoading ? "Saving…" : "Save"}</button>
                    <button onClick={() => setEditingId(null)} className="flex-1 rounded border border-gray-300 py-1.5 text-xs text-gray-600">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex gap-3 text-xs">
                  <button onClick={() => setExpandedId(expandedId === r.id ? null : r.id)} className="text-gray-500 hover:text-gray-800">{expandedId === r.id ? "Hide" : "View"}</button>
                  <button onClick={() => startEdit(r)} className="text-blue-600">Edit</button>
                  <button onClick={() => handleDelete(r.id)} className="text-red-500">Delete</button>
                </div>
              )}
              {expandedId === r.id && (
                <pre className="mt-3 overflow-x-auto rounded bg-gray-50 p-2 text-xs text-gray-600 max-h-40">{JSON.stringify(r.weather_data, null, 2)}</pre>
              )}
            </div>
          ))}
        </div>
      )}

      {hasMore && (
        <button onClick={() => load(skip + PAGE_SIZE, true)} disabled={loading} className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50">
          {loading ? "Loading…" : "Load more"}
        </button>
      )}
    </div>
  );
}
