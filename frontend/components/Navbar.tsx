"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/forecast", label: "Forecast" },
  { href: "/history", label: "History" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 font-bold text-blue-600 hover:text-blue-700"
        >
          <span className="text-xl">🌤</span>
          <span>WeatherApp</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 text-sm font-medium sm:flex">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`transition-colors hover:text-blue-600 ${pathname === href ? "font-semibold text-blue-600" : "text-slate-600"}`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Hamburger button (mobile) */}
        <button
          className="flex flex-col gap-1.5 p-1 sm:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <span className={`block h-0.5 w-6 bg-slate-700 transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`block h-0.5 w-6 bg-slate-700 transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-6 bg-slate-700 transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </nav>

      {/* Mobile dropdown */}
      {open && (
        <div className="border-t border-slate-100 bg-white sm:hidden">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`block px-5 py-3 text-sm font-medium transition-colors hover:bg-slate-50 ${pathname === href ? "text-blue-600" : "text-slate-700"}`}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
