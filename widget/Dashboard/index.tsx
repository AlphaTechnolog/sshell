import { Astal, Gdk, Gtk } from "ags/gtk4";
import app from "ags/gtk4/app";
import { createBinding } from "gnim";
import { createPoll } from "ags/time";
import { S_PER_MS } from "../../constants";

import Wp from "gi://AstalWp";
import MusicPlayer from "./music-player";

function Clock() {
  const contents = createPoll("00:00", 1 * S_PER_MS, "date '+%H:%M'")
  const day = createPoll("Loading", 30 * S_PER_MS, "date '+%A %B %Y'")

  return (
    <box
      orientation={Gtk.Orientation.VERTICAL}
      hexpand
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.START}
      class="Clock"
    >
      <label class="Time" label={contents} />
      <label class="Day" label={day} />
    </box>
  );
}

function SliderContainer({ children, ...rest }: Record<string, any> & {
  children: JSX.Element[] | JSX.Element;
}) {
  return (
    <box {...rest} orientation={Gtk.Orientation.HORIZONTAL} hexpand spacing={7}>
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
    <SliderContainer class="VolumeSlider">
      <image iconName={volumeIcon} valign={Gtk.Align.CENTER} />
      <slider
        value={volume}
        min={0}
        max={1}
        onValueChanged={({ value }) => handleChange(value)}
        hexpand
        valign={Gtk.Align.CENTER}
      />
    </SliderContainer>
  )
}

// FIXME: Disabled since i need hardware to test brightness control such as a laptop.
function BrightnessSlider() {
  return (
    <SliderContainer class="VolumeSlider">
      <image iconName="display-brightness-symbolic" valign={Gtk.Align.CENTER} />

      <slider
        value={0}
        min={0}
        max={0}
        hexpand
        valign={Gtk.Align.CENTER}
        step={0} // effectively disables slider
      />
    </SliderContainer>
  );
}

function Sliders() {
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

function MainInformation() {
  return (
    <box
      hexpand
      vexpand
      class="Left"
      widthRequest={400}
      orientation={Gtk.Orientation.VERTICAL}
      spacing={7}
    >
      <Clock />
      <Sliders />
      <MusicPlayer />
    </box>
  );
}

function Separator() {
  return (
    <box halign={Gtk.Align.CENTER} vexpand class="Separator" widthRequest={1} />
  );
}

export default function Dashboard(gdkmonitor: Gdk.Monitor) {
  const { TOP } = Astal.WindowAnchor;

  return (
    <window
      class="Dashboard"
      name="Dashboard"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.NORMAL}
      anchor={TOP}
      visible
      marginTop={7}
      application={app}
    >
      <box class="MainContent" orientation={Gtk.Orientation.HORIZONTAL}>
        <MainInformation />
        {/* TODO: Notifications Panel */}
        {/* <Separator /> */}
        {/* <box hexpand vexpand class="Right"> */}
        {/*   <label */}
        {/*     hexpand */}
        {/*     halign={Gtk.Align.CENTER} */}
        {/*     valign={Gtk.Align.START} */}
        {/*     label="hello 2" */}
        {/*   /> */}
        {/* </box> */}
      </box>
    </window>
  );
}
