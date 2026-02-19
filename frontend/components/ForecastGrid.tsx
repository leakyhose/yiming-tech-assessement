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

const weatherEmoji: Record<string, string> = {
  '01d': '☀️', '01n': '🌙',
  '02d': '⛅', '02n': '☁️',
  '03d': '☁️', '03n': '☁️',
  '04d': '☁️', '04n': '☁️',
  '09d': '🌧️', '09n': '🌧️',
  '10d': '🌦️', '10n': '🌧️',
  '11d': '⛈️', '11n': '⛈️',
  '13d': '❄️', '13n': '❄️',
  '50d': '🌫️', '50n': '🌫️',
};

function dayName(dateStr: string): string {
  return new Date(dateStr + "T12:00:00Z").toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
}

function shortDate(dateStr: string): string {
  return new Date(dateStr + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

export default function ForecastGrid({ daily, locationName }: Props) {
  if (!daily.length) return <p className="text-gray-500">No forecast data available.</p>;

  return (
    <div className="space-y-3">
      {locationName && (
        <h2 className="text-lg font-semibold text-gray-800">5-Day Forecast: {locationName}</h2>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {daily.map((day) => (
          <div key={day.date} className="rounded-lg border border-gray-200 bg-white p-4 text-center">
            <p className="font-medium text-gray-800">{dayName(day.date)}</p>
            <p className="text-xs text-gray-400">{shortDate(day.date)}</p>
            <span className="text-4xl my-2 block">{weatherEmoji[day.icon] || '🌡️'}</span>
            <p className="text-xs text-gray-500 capitalize">{day.description}</p>
            <div className="mt-2 flex justify-center gap-2 text-sm">
              <span className="font-semibold text-gray-900">H {Math.round(day.temp_max)}°</span>
              <span className="text-gray-400">L {Math.round(day.temp_min)}°</span>
            </div>
            <p className="mt-1 text-xs text-gray-400">{day.humidity}% humidity</p>
          </div>
        ))}
      </div>
    </div>
  );
}
