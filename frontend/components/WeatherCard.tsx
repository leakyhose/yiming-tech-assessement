import Image from "next/image";

interface Props {
  data: {
    resolved_location: string;
    weather: {
      main: { temp: number; feels_like: number; humidity: number; pressure: number };
      weather: { description: string; icon: string }[];
      wind: { speed: number };
      visibility?: number;
      sys: { country: string; sunrise: number; sunset: number };
      name: string;
    };
  };
}

function formatTime(unix: number): string {
  return new Date(unix * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function WeatherCard({ data }: Props) {
  const { weather } = data;
  const condition = weather.weather[0];
  const iconUrl = `https://openweathermap.org/img/wn/${condition.icon}@2x.png`;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Location + country */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {weather.name}, {weather.sys.country}
          </h2>
          <p className="text-sm text-slate-500 truncate max-w-xs">{data.resolved_location}</p>
        </div>
        {/* Temperature + icon */}
        <div className="flex items-center gap-1">
          <Image src={iconUrl} alt={condition.description} width={64} height={64} unoptimized />
          <span className="text-5xl font-extrabold text-slate-900">
            {Math.round(weather.main.temp)}°F
          </span>
        </div>
      </div>

      <p className="mt-1 text-lg capitalize text-slate-600">{condition.description}</p>
      <p className="text-sm text-slate-500">Feels like {Math.round(weather.main.feels_like)}°F</p>

      {/* Stats grid */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Humidity" value={`${weather.main.humidity}%`} />
        <Stat label="Wind" value={`${Math.round(weather.wind.speed)} mph`} />
        {weather.visibility != null && (
          <Stat label="Visibility" value={`${(weather.visibility / 1000).toFixed(1)} km`} />
        )}
        <Stat label="Pressure" value={`${weather.main.pressure} hPa`} />
        <Stat label="Sunrise" value={formatTime(weather.sys.sunrise)} />
        <Stat label="Sunset" value={formatTime(weather.sys.sunset)} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-semibold text-slate-800">{value}</p>
    </div>
  );
}
