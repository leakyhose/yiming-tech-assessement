import Image from "next/image";

interface DayForecast {
  date: string;
  temp_min: number;
  temp_max: number;
  humidity: number;
  icon: string;
  description: string;
}

interface Props {
  daily: DayForecast[];
  locationName?: string;
}

function dayName(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00Z");
  return d.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
}

function shortDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00Z");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

export default function ForecastGrid({ daily, locationName }: Props) {
  if (!daily.length) return <p className="text-slate-500">No forecast data available.</p>;

  return (
    <div className="space-y-4">
      {locationName && (
        <h2 className="text-xl font-semibold text-slate-700">5-Day Forecast — {locationName}</h2>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {daily.map((day) => (
          <div
            key={day.date}
            className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <p className="font-semibold text-slate-800">{dayName(day.date)}</p>
            <p className="text-xs text-slate-500">{shortDate(day.date)}</p>
            <Image
              src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
              alt={day.description}
              width={56}
              height={56}
              unoptimized
              className="my-1"
            />
            <p className="text-xs capitalize text-slate-500 text-center">{day.description}</p>
            <div className="mt-2 flex items-center gap-3 text-sm">
              <span className="font-bold text-blue-600">{Math.round(day.temp_max)}°</span>
              <span className="text-slate-400">{Math.round(day.temp_min)}°</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">💧 {day.humidity}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}
