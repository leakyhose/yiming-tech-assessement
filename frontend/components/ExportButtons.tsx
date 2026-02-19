"use client";

import { useState } from "react";
import { exportData } from "@/lib/api";

const FORMATS = ["json", "csv", "xml", "pdf", "markdown"] as const;
const EXT: Record<string, string> = { json: "json", csv: "csv", xml: "xml", pdf: "pdf", markdown: "md" };

export default function ExportButtons() {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleExport(format: string) {
    setBusy(format);
    setError("");
    try {
      const { blob } = await exportData(format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `weather_queries.${EXT[format]}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Export failed. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {FORMATS.map((f) => (
          <button
            key={f}
            onClick={() => handleExport(f)}
            disabled={busy !== null}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors uppercase"
          >
            {busy === f ? "Exporting…" : f}
          </button>
        ))}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
