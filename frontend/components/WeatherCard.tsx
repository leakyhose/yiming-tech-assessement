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
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {data.resolved_location}
          </h2>
          <p className="text-sm text-gray-500 capitalize">{condition.description}</p>
          <p className="text-sm text-gray-400">Feels like {Math.round(weather.main.feels_like)}°F</p>
        </div>
        <div className="flex items-center gap-1">
          <Image src={iconUrl} alt={condition.description} width={56} height={56} unoptimized />
          <span className="text-5xl font-semibold text-gray-900 tabular-nums">
            {Math.round(weather.main.temp)}°F
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 border-t border-gray-100 pt-4">
        <Stat label="Humidity" value={`${weather.main.humidity}%`} />
        <Stat label="Wind" value={`${Math.round(weather.wind.speed)} mph`} />
        <Stat label="Pressure" value={`${weather.main.pressure} hPa`} />
        {weather.visibility != null && (
          <Stat label="Visibility" value={`${(weather.visibility / 1000).toFixed(1)} km`} />
        )}
        <Stat label="Sunrise" value={formatTime(weather.sys.sunrise)} />
        <Stat label="Sunset" value={formatTime(weather.sys.sunset)} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-1">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}
