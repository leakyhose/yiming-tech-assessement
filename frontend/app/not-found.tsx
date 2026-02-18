import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-4xl">🌫️</p>
      <h2 className="text-xl font-bold text-slate-800">Page not found</h2>
      <p className="text-sm text-slate-500">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
        Go to Weather App
      </Link>
    </div>
  );
}
