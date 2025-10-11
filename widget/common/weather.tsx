import { Gtk } from "ags/gtk4";
import { type HourlyForecastItem, Weather as WeatherService } from "../../services";
import { createBinding, createComputed, For } from "gnim";

const icons = {
  cloudy: {
    moon: "\uE53E",
    sun: "\uE540",
  },
  regular: {
    moon: "\uE330",
    sun: "\uE472",
  },
};

const SUNRISE = '2025-10-10T06:00:00.000Z'; // 06:00 AM
const SUNSET = '2025-10-10T18:00:00.000Z'; // 06:00 PM

const isCurrentDateSunUp = () => {
  const now = new Date();
  const sunriseDate = new Date(SUNRISE);
  const sunsetDate = new Date(SUNSET);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const sunriseMinutes = sunriseDate.getHours() * 60 + sunriseDate.getMinutes();
  const sunsetMinutes = sunsetDate.getHours() * 60 + sunsetDate.getMinutes();
  return nowMinutes > sunriseMinutes && nowMinutes < sunsetMinutes;
}

const isSunUp = (targetTimeString: string) => {
  const baseDate = new Date();
  const [timeValue, ampm] = targetTimeString.toUpperCase().split(" ");
  let hour = parseInt(timeValue, 10);

  if (ampm === "PM" && hour !== 12) {
    hour += 12;
  } else if (ampm === "AM" && hour === 12) {
    hour = 0;
  }

  const targetDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), hour, 0, 0, 0);
  const sunriseDate = new Date(SUNRISE);
  const sunsetDate = new Date(SUNSET);

  const targetTimeMs = targetDate.getTime();
  const sunriseTimeMs = sunriseDate.getTime();
  const sunsetTimeMs = sunsetDate.getTime();

  return targetTimeMs > sunriseTimeMs && targetTimeMs < sunsetTimeMs;
}

function PredictionItem({ prediction }: { prediction: HourlyForecastItem }) {
  const icon = icons[prediction.isCloudy ? "cloudy" : "regular"][isSunUp(prediction.time) ? "sun" : "moon"];
  return (
    <box
      orientation={Gtk.Orientation.VERTICAL}
      spacing={2}
      class="PredictionItem"
    >
      <label
        hexpand
        halign={Gtk.Align.CENTER}
        vexpand
        valign={Gtk.Align.CENTER}
        label={prediction.time}
        class="Hour"
      />
      <label
        hexpand
        halign={Gtk.Align.CENTER}
        vexpand
        valign={Gtk.Align.CENTER}
        label={icon}
        class="Icon"
      />
      <label
        hexpand
        halign={Gtk.Align.CENTER}
        vexpand
        valign={Gtk.Align.CENTER}
        label={prediction.temperature}
        class="Temperature"
      />
    </box>
  )
}

export function Weather() {
  const weather = WeatherService.get_default();

  const isCloudy = createBinding(weather, "is_cloudy");
  const title = createBinding(weather, "title");
  const humidity = createBinding(weather, "humidity");
  const currentTemp = createBinding(weather, "current_temp");
  const feelsLike = createBinding(weather, "feels_like");
  const hourlyForecast = createBinding(weather, "hourly_forecast");

  const icon = createComputed([isCloudy], cloudy => {
    return icons[cloudy ? "cloudy" : "regular"][isCurrentDateSunUp() ? "sun" : "moon"];
  });

  return (
    <box
      class="Weather"
      orientation={Gtk.Orientation.VERTICAL}
      hexpand
      vexpand
    >
      <box
        hexpand
        vexpand
        class="ContentContainer"
        orientation={Gtk.Orientation.VERTICAL}
      >
        <centerbox
          hexpand
          vexpand
          valign={Gtk.Align.START}
          class="Header"
        >
          <box
            $type="start"
            vexpand
            hexpand
          >
            <label
              label={icon}
              vexpand
              valign={Gtk.Align.CENTER}
              hexpand
              halign={Gtk.Align.START}
              class="OverviewIcon"
            />
          </box>
          <box
            $type="center"
            vexpand
            hexpand
          >
            <box
              marginStart={12}
              orientation={Gtk.Orientation.VERTICAL}
              vexpand
              hexpand
            >
              <label
                label={title}
                vexpand
                valign={Gtk.Align.CENTER}
                hexpand
                halign={Gtk.Align.START}
                class="OverviewTitle"
              />
              <label
                label={humidity(h => `Humidity: ${h}`)}
                class="Humidity"
                vexpand
                valign={Gtk.Align.CENTER}
                hexpand
                halign={Gtk.Align.START}
              />
            </box>
          </box>
          <box
            $type="end"
            vexpand
            hexpand
          >
            <label
              label={currentTemp}
              vexpand
              valign={Gtk.Align.CENTER}
              hexpand
              halign={Gtk.Align.END}
              class="Temperature"
            />
          </box>
        </centerbox>
        <label
          hexpand
          halign={Gtk.Align.END}
          vexpand
          valign={Gtk.Align.START}
          label={feelsLike(value => `Feels like: ${value}`)}
          class="FeelsLike"
        />
        <box
          marginTop={12}
          heightRequest={60}
          hexpand
          orientation={Gtk.Orientation.HORIZONTAL}
          homogeneous
          class="PredictionsContainer"
        >
          <For each={hourlyForecast}>
            {prediction => <PredictionItem prediction={prediction} />}
          </For>
          {/*{Array.from({ length: 6 }).map(() => (
            <box
              orientation={Gtk.Orientation.VERTICAL}
              spacing={2}
              class="PredictionItem"
            >
              <label
                hexpand
                halign={Gtk.Align.CENTER}
                vexpand
                valign={Gtk.Align.CENTER}
                label="03AM"
                class="Hour"
              />
              <label
                hexpand
                halign={Gtk.Align.CENTER}
                vexpand
                valign={Gtk.Align.CENTER}
                label={icons.regular.sun}
                class="Icon"
              />
              <label
                hexpand
                halign={Gtk.Align.CENTER}
                vexpand
                valign={Gtk.Align.CENTER}
                label="19°"
                class="Temperature"
              />
            </box>
          ))}*/}
        </box>
      </box>
    </box>
  )
}
