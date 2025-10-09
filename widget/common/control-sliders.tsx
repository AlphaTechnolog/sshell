import { Gtk } from "ags/gtk4";
import { createBinding } from "gnim";

import Wp from "gi://AstalWp";
import { Brightness } from "../../services/";

function SliderContainer({ children, ...rest }: Record<string, any> & {
  children: JSX.Element[] | JSX.Element;
}) {
  return (
    <box
      class="SliderContainer"
      orientation={Gtk.Orientation.HORIZONTAL}
      hexpand
      spacing={7}
      {...rest}
    >
      {children}
    </box>
  );
}

function VolumeSlider() {
  const wp = Wp.get_default();
  const volumeIcon = createBinding(wp.defaultSpeaker, "volumeIcon");
  const volume = createBinding(wp.defaultSpeaker, "volume");

  function handleChange(value: number) {
    wp.defaultSpeaker.set_volume(value);
  }

  return (
    <SliderContainer>
      <image iconName={volumeIcon} valign={Gtk.Align.CENTER} />
      <slider
        value={volume}
        min={0}
        max={1}
        onValueChanged={({ value }) => handleChange(value)}
        hexpand
        valign={Gtk.Align.CENTER}
      />
      <label label={volume(v => `${Math.floor(v * 100)}%`)} />
    </SliderContainer>
  )
}

// FIXME: Needs testing on device with brightness support.
function BrightnessSlider() {
  const brightness = Brightness.get_default();
  const available = createBinding(brightness, "available");
  const screen = createBinding(brightness, "screen");

  function handleChange(value: number) {
    if (brightness.available === false) return;
    brightness.screen = value;
  }

  return (
    <SliderContainer class={available(a => `SliderContainer ${a ? "" : "Disabled"}`)}>
      <image iconName="display-brightness-symbolic" valign={Gtk.Align.CENTER} />

      <slider
        value={screen}
        min={0}
        max={available(a => Number(a))} // will disable if not available
        hexpand
        valign={Gtk.Align.CENTER}
        step={available(a => a ? 0.05 : 0)}
        onChangeValue={({ value }) => handleChange(value)}
      />

      <label label={screen(v => `${Math.floor(v * 100)}%`)} />
    </SliderContainer>
  );
}

export function ControlSliders() {
  return (
    <box
      class="SlidersContainer"
      orientation={Gtk.Orientation.VERTICAL}
      hexpand
      spacing={8}
    >
      <label class="Title" label="Stats" valign={Gtk.Align.START} halign={Gtk.Align.START} />
      <box orientation={Gtk.Orientation.VERTICAL} class="Content" spacing={6} hexpand>
        <VolumeSlider />
        <BrightnessSlider />
      </box>
    </box>
  );
}
