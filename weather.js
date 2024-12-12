const WEATHER_API_KEY = 'a6fd1c79bde11cb72c6f9bd39629b63e';
const WEATHER_API_BASE = 'https://api.openweathermap.org/data/2.5/weather';

class WeatherCommand {
    constructor() {
        this.description = "Show weather for a city. Usage: weather [city]";
        this.output = "dynamic";
    }

    getWeatherArt(condition) {
        const weatherArt = {
            'Clear': `
    \\   /
  - (   ) -
    /   \\`,
            'Partly Cloudy': `
    \\   /
  - /"".-
    \\_(    )
    /(__(_)`,
            'Cloudy': `
   ,---.
 ,(     ),
    '---'`,
            'Rain': `
    .---.
  ,\\_(   ).
   /(___(__)
    ' ' ' '`,
            'Snow': `
    .---.
  ,\\_(   ).
   /(___(__)
    * * * *`
        };
        return weatherArt[condition] || weatherArt['Clear'];
    }

    formatTimeBlock(data, title) {
        const art = this.getWeatherArt(data.condition);
        return `
│ ${title.padEnd(20)} │
├──────────────────────┤
${art}
   ${data.temp}°C
   ↗ ${data.wind} km/h
   ${data.visibility} km
   ${data.precipitation} mm | ${data.probability}%
`;
    }

    async execute(args) {
        if (args.length === 0) {
            return 'Syntax: weather <city>\nExample: weather London';
        }

        const city = args.join(' ');
        try {
            const data = await this.getWeather(city);
            
            // Sample daily forecast data (you'll need to get this from your weather API)
            const forecast = {
                current: {
                    condition: data.weather[0].main,
                    temp: Math.round(data.main.temp),
                    wind: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
                    visibility: Math.round(data.visibility / 1000),
                    precipitation: 0,
                    probability: 0
                },
                morning: {
                    condition: "Partly Cloudy",
                    temp: Math.round(data.main.temp) - 1,
                    wind: Math.round(data.wind.speed * 3.6),
                    visibility: 10,
                    precipitation: 0,
                    probability: 0
                },
                noon: {
                    condition: data.weather[0].main,
                    temp: Math.round(data.main.temp),
                    wind: Math.round(data.wind.speed * 3.6),
                    visibility: 10,
                    precipitation: 0,
                    probability: 0
                },
                evening: {
                    condition: data.weather[0].main,
                    temp: Math.round(data.main.temp) - 2,
                    wind: Math.round(data.wind.speed * 3.6),
                    visibility: 10,
                    precipitation: 0,
                    probability: 0
                },
                night: {
                    condition: "Clear",
                    temp: Math.round(data.main.temp) - 3,
                    wind: Math.round(data.wind.speed * 3.6),
                    visibility: 10,
                    precipitation: 0,
                    probability: 0
                }
            };

            const today = new Date();
            const dateStr = today.toLocaleDateString('en-US', { 
                weekday: 'short', 
                day: '2-digit', 
                month: 'short'
            });

            return `Weather report: ${city.toLowerCase()}

Current conditions:
   ${data.weather[0].main}
   ${Math.round(data.main.temp)}°C
   ↗ ${Math.round(data.wind.speed * 3.6)} km/h
   ${Math.round(data.visibility / 1000)} km
   0.0 mm

┌────────────────┬────────────────┬────────────────┬────────────────┐
│ Morning        │ Noon           │ Evening        │ Night          │
├────────────────┼────────────────┼────────────────┼────────────────┤
│ Temperature:   │ Temperature:   │ Temperature:   │ Temperature:   │
│    ${forecast.morning.temp.toString().padEnd(2)}°C        │    ${forecast.noon.temp.toString().padEnd(2)}°C        │    ${forecast.evening.temp.toString().padEnd(2)}°C        │    ${forecast.night.temp.toString().padEnd(2)}°C        │
│ Wind Speed:    │ Wind Speed:    │ Wind Speed:    │ Wind Speed:    │
│    ↗ ${forecast.morning.wind.toString().padEnd(2)} km/h   │    ↗ ${forecast.noon.wind.toString().padEnd(2)} km/h   │    ↗ ${forecast.evening.wind.toString().padEnd(2)} km/h   │    ↗ ${forecast.night.wind.toString().padEnd(2)} km/h   │
│ Visibility:    │ Visibility:    │ Visibility:    │ Visibility:    │
│    ${forecast.morning.visibility.toString().padEnd(2)} km       │    ${forecast.noon.visibility.toString().padEnd(2)} km       │    ${forecast.evening.visibility.toString().padEnd(2)} km       │    ${forecast.night.visibility.toString().padEnd(2)} km       │
│ Precipitation: │ Precipitation: │ Precipitation: │ Precipitation: │
│    ${forecast.morning.precipitation} mm | ${forecast.morning.probability.toString().padEnd(3)}% │    ${forecast.noon.precipitation} mm | ${forecast.noon.probability.toString().padEnd(3)}% │    ${forecast.evening.precipitation} mm | ${forecast.evening.probability.toString().padEnd(3)}% │    ${forecast.night.precipitation} mm | ${forecast.night.probability.toString().padEnd(3)}% │
└────────────────┴────────────────┴────────────────┴────────────────┘

Location: ${data.name}, ${data.sys.country} [${data.coord.lat},${data.coord.lon}]`;
        } catch (error) {
            throw new Error('Could not find weather for that city. Please check the city name and try again.');
        }
    }

    async getWeather(city) {
        try {
            const response = await fetch(`${WEATHER_API_BASE}?q=${city}&appid=${WEATHER_API_KEY}&units=metric`);
            if (!response.ok) {
                throw new Error('City not found');
            }
            return await response.json();
        } catch (error) {
            throw new Error('Could not find weather for that city. Please check the city name and try again.');
        }
    }
}

export default WeatherCommand;