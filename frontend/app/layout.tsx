import type { Metadata } from "next";
import { Syne } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const syne = Syne({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Weather App — Yiming Su",
  description: "Full-stack weather application with current conditions, 5-day forecast, and historical data.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${syne.className} min-h-screen bg-white text-gray-900 antialiased`}>
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
