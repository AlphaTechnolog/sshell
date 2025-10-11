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

const isCurrentDateSunUp = (): boolean => {
  const now = new Date();
  const hour24 = now.getHours();
  const SUNRISE_HOUR = 6;
  const SUNSET_HOUR = 18;
  return hour24 >= SUNRISE_HOUR && hour24 < SUNSET_HOUR;
}

const isSunUp = (targetTimeString: string): boolean => {
  const [timeValue, ampm] = targetTimeString.toUpperCase().split(" ");
  let hour24 = parseInt(timeValue, 10);

  if (ampm === "PM" && hour24 !== 12) {
    hour24 += 12;
  } else if (ampm === "AM" && hour24 === 12) {
    hour24 = 0;
  }

  const SUNRISE_HOUR = 6;
  const SUNSET_HOUR = 18;

  return hour24 >= SUNRISE_HOUR && hour24 < SUNSET_HOUR;
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
  const failed = createBinding(weather, "failed");

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
      >
        <overlay>
          <box vexpand hexpand orientation={Gtk.Orientation.VERTICAL}>
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
            </box>
          </box>
          <box
            $type="overlay"
            vexpand
            hexpand
            halign={Gtk.Align.END}
            valign={Gtk.Align.END}
            visible={failed}
          >
            <button
              class="RetryButton"
              vexpand
              hexpand
              halign={Gtk.Align.CENTER}
              valign={Gtk.Align.CENTER}
              onClicked={() => weather.fetchWeatherData()}
            >
              <box vexpand hexpand orientation={Gtk.Orientation.HORIZONTAL} spacing={7}>
                <label
                  class="RetryButtonIcon"
                  vexpand
                  valign={Gtk.Align.CENTER}
                  label={"\uE20C"}
                />
                <label
                  class="RetryButtonLabel"
                  vexpand
                  valign={Gtk.Align.CENTER}
                  label="Try again"
                />
              </box>
            </button>
          </box>
        </overlay>
      </box>
    </box>
  )
}
