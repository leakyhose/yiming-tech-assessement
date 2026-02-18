import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Navbar from "@/components/Navbar";
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
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">{children}</main>
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
