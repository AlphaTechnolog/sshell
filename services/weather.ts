import { interval } from "ags/time";
import GObject, { register, getter } from "gnim/gobject";
import { MIN_PER_MS } from "../constants";
import { execAsync } from "ags/process";

export type GeoLocation = {
  lat: number;
  lon: number;
  timezone: string;
};

export type HourlyForecastItem = {
  time: string;
  temperature: string;
  isCloudy: boolean;
};

@register({ GTypeName: "Weather" })
export class Weather extends GObject.Object {
  static instance: Weather;
  static get_default() {
    return this.instance ||= new Weather();
  }

  #fetching = true;
  #isCloudy = false;
  #title = "No data";
  #humidity = "0%";
  #currentTemp = "0°";
  #feelsLike = "0°";
  #hourlyForecast: HourlyForecastItem[] = [];

  @getter(Boolean)
  get fetching() { return this.#fetching; }

  @getter(Boolean)
  get is_cloudy() { return this.#isCloudy; }

  @getter(String)
  get title() { return this.#title; }

  @getter(String)
  get humidity() { return this.#humidity;  }

  @getter(String)
  get current_temp() { return this.#currentTemp; }

  @getter(String)
  get feels_like() { return this.#feelsLike; }

  @getter(Array)
  get hourly_forecast() { return this.#hourlyForecast; }

  constructor() {
    super();
    interval(30 * MIN_PER_MS, () => this.#fetchWeatherData());
  }

  #isCloudyCode(code: number): boolean {
    // Codes 2, 3 (Partly Cloudy, Overcast) are definitely cloudy.
    // Codes 45-48 (Fog/Rime) have low visibility and are visually "cloudy."
    // Codes 51+ (Precipitation) also require cloud cover.
    return code >= 2;
  }

  async #getApproximateLocation(): Promise<GeoLocation> {
    const geoIpUrl = "http://ip-api.com/json/";
    try {
      const rawResponse = await execAsync(["curl", geoIpUrl]);
      const data: Record<string, any> & GeoLocation = JSON.parse(rawResponse);
      return {
        lat: data.lat,
        lon: data.lon,
        timezone: data.timezone,
      };
    } catch (err) {
      console.error(
        "error during geoip lookup. Falling back to default location (London)."
      );
      return {
        lat: 51.5074,
        lon: 0.1278,
        timezone: "Europe/London",
      };
    }
  }

  #urlWithParams<T>(base: string, params: Record<string, T>) {
    let newUrl = base;
    let idx = 0;
    if (Object.keys(params).length > 0) newUrl += "?";
    for (const [key, value] of Object.entries(params)) {
      if (idx++ > 0) newUrl += "&";
      newUrl += `${key}=${value}`;
    }
    return newUrl;
  }

  async #fetchWeatherData() {
    const { lat, lon, timezone } = await this.#getApproximateLocation();

    const url = this.#urlWithParams("https://api.open-meteo.com/v1/forecast", {
      latitude: lat,
      longitude: lon,
      timezone,
      hourly:
        "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code",
      current:
        "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code",
      temperature_unit: "celsius",
      forecast_hours: 48,
    });

    try {
      this.#fetching = true;
      this.notify("fetching");

      const rawResponse = await execAsync(["curl", url]);
      const data: Record<string, any> = JSON.parse(rawResponse);

      const currentTime = new Date();
      const nowHourIndex = data.hourly.time.findIndex((t: string) => {
        const hour = new Date(t).getHours();
        return hour === currentTime.getHours();
      });
      const indexToUse = nowHourIndex === -1 ? 0 : nowHourIndex;

      const currentCode = data.current.weather_code;
      const currentTemp = Math.round(data.current.temperature_2m);
      const feelsLike = Math.round(data.current.apparent_temperature);
      const humidity = data.current.relative_humidity_2m;

      let weatherDescription = "Varied conditions";
      if (currentCode === 0) weatherDescription = "Clear sky";
      else if (currentCode === 1) weatherDescription = "Mostly clear";
      else if (currentCode === 2) weatherDescription = "Partly cloudy";
      else if (currentCode === 3) weatherDescription = "Overcast clouds";
      else if (currentCode >= 51 && currentCode <= 65)
        weatherDescription = "Rain";
      else if (currentCode >= 71 && currentCode <= 75)
        weatherDescription = "Snow";

      const hourlyForecast: HourlyForecastItem[] = [];
      for (let i = indexToUse; i < indexToUse + 6; ++i) {
        if (i < data.hourly.time.length) {
          const hourDate = new Date(data.hourly.time[i]);
          const timeStr = hourDate.toLocaleTimeString("en-US", {
            hour: "2-digit",
            hour12: true,
          });
          const temperature = Math.round(data.hourly.temperature_2m[i]);
          const hourCode = data.hourly.weather_code[i];

          hourlyForecast.push({
            time: timeStr
              .replace(/\s*[apAP][mM]/, (match: string) => match.toUpperCase())
              .replace(":00", "")
              .trim(),
            temperature: `${temperature}°`,
            isCloudy: this.#isCloudyCode(hourCode),
          });
        }
      }

      this.#isCloudy = this.#isCloudyCode(currentCode);
      this.#title = weatherDescription;
      this.#humidity = `${humidity}%`;
      this.#currentTemp = `${currentTemp}°`
      this.#feelsLike = `${feelsLike}°`;
      this.#hourlyForecast = hourlyForecast;

      [
        "is_cloudy",
        "title",
        "humidity",
        "current_temp",
        "feels_like",
        "hourly_forecast",
      ].forEach(x => this.notify(x));

      this.#fetching = false;
      this.notify("fetching");
    } catch (err) {
      console.error("Failed to retrieve weather data:", err);
    }
  }
}
