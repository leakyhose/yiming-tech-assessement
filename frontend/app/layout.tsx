import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Weather App — Yiming Su",
  description: "Full-stack weather application with current conditions, 5-day forecast, and historical data.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} min-h-screen bg-slate-50 text-slate-900 antialiased`}>
        {/* ── Navbar ── */}
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-bold text-blue-600 hover:text-blue-700">
              <span className="text-xl">🌤</span>
              <span className="hidden sm:inline">WeatherApp</span>
            </Link>

            {/* Desktop links */}
            <div className="hidden items-center gap-6 text-sm font-medium sm:flex">
              <Link href="/" className="text-slate-600 hover:text-blue-600 transition-colors">
                Home
              </Link>
              <Link href="/forecast" className="text-slate-600 hover:text-blue-600 transition-colors">
                Forecast
              </Link>
              <Link href="/history" className="text-slate-600 hover:text-blue-600 transition-colors">
                History
              </Link>
            </div>

            {/* Mobile links */}
            <div className="flex items-center gap-4 text-sm font-medium sm:hidden">
              <Link href="/" className="text-slate-600 hover:text-blue-600">Home</Link>
              <Link href="/forecast" className="text-slate-600 hover:text-blue-600">Forecast</Link>
              <Link href="/history" className="text-slate-600 hover:text-blue-600">History</Link>
            </div>
          </nav>
        </header>

        {/* ── Page content ── */}
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>

        {/* ── Footer ── */}
        <footer className="mt-16 border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-slate-500">
            <p className="font-semibold text-slate-700">Built by Yiming Su</p>
            <p className="mt-2 max-w-prose leading-relaxed">
              <span className="font-medium text-slate-600">PM Accelerator</span> — Product Manager
              Accelerator is the world&apos;s first AI-powered career accelerator for product managers.
              We help PMs land top tech jobs and advance their careers through personalized coaching,
              real-world projects, and a global community of 30,000+ product professionals. Our programs
              combine AI-driven learning with mentorship from senior PMs at companies like Google, Meta,
              Amazon, and more.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
