"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/history", label: "Saved Queries" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" onClick={() => setOpen(false)} className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
          WeatherApp
        </Link>

        <div className="hidden items-center gap-6 text-sm sm:flex">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`transition-colors ${pathname === href ? "text-blue-600 font-medium" : "text-gray-500 hover:text-gray-900"}`}
            >
              {label}
            </Link>
          ))}
        </div>

        <button
          className="flex flex-col gap-1.5 p-1 sm:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <span className={`block h-0.5 w-5 bg-gray-700 transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`block h-0.5 w-5 bg-gray-700 transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-5 bg-gray-700 transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </nav>

      {open && (
        <div className="border-t border-gray-100 bg-white sm:hidden">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`block px-4 py-3 text-sm transition-colors ${pathname === href ? "text-blue-600 font-medium" : "text-gray-600 hover:text-gray-900"}`}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
