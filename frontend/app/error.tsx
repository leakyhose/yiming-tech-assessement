"use client";

import { useEffect } from "react";
import Link from "next/link";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error("Unhandled app error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-4xl">⚠️</p>
      <h2 className="text-xl font-bold text-slate-800">Something went wrong</h2>
      <p className="text-sm text-slate-500 max-w-sm">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Try again
        </button>
        <Link href="/" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
          Go home
        </Link>
      </div>
    </div>
  );
}
