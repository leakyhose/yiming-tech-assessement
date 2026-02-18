"use client";

import { useState } from "react";
import { exportData } from "@/lib/api";

const FORMATS = [
  { key: "json", label: "JSON", mime: "application/json" },
  { key: "csv", label: "CSV", mime: "text/csv" },
  { key: "xml", label: "XML", mime: "application/xml" },
  { key: "pdf", label: "PDF", mime: "application/pdf" },
  { key: "markdown", label: "Markdown", mime: "text/markdown" },
] as const;

export default function ExportButtons() {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleExport(format: string, filename: string) {
    setBusy(format);
    setError("");
    try {
      const { blob } = await exportData(format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Export failed. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  const ext: Record<string, string> = {
    json: "json", csv: "csv", xml: "xml", pdf: "pdf", markdown: "md",
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {FORMATS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleExport(key, `weather_queries.${ext[key]}`)}
            disabled={busy !== null}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            {busy === key ? "Exporting…" : `↓ ${label}`}
          </button>
        ))}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
