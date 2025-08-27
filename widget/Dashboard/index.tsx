import app from "ags/gtk4/app";
import GLib from "gi://GLib?version=2.0";
import { Astal, Gdk, Gtk } from "ags/gtk4";
import { createBinding, createState, With } from "gnim";
import { createPoll } from "ags/time";
import { fileExists } from "../../utils/fs";
import { S_PER_MS } from "../../constants";

import Wp from "gi://AstalWp";
import MusicPlayer from "./music-player";
import Notifications from "./notifications";
import { Brightness, Uptime } from "../../services/";
import { capitalize } from "../../utils";

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

function UserContainer() {
  const uptime = Uptime.get_default();
  const fmttedUptime = createBinding(uptime, "formatted");
  const whoami = GLib.getenv("USER") ?? "nobody";
  const [faceUrl, setFaceUrl] = createState<string | undefined>(undefined);

  // FIXME: We could extract this to a service
  async function getData() {
    const home = GLib.getenv("HOME") ?? "/home/" + whoami;
    const pfpPath = `${home}/.face`;
    for (const x of [".png", ".jpg"]) {
      const v = pfpPath.concat(x);
      if (await fileExists(v)) {
        setFaceUrl(v);
        break;
      }
    }
  }

  getData();

  // TODO
  function handleLockPC() {
    console.log("handleLockPC");
  }

  // TODO
  function handlePoweroffPC() {
    console.log("handlePoweroffPC");
  }

  return (
    <box
      class="UserContainer"
      orientation={Gtk.Orientation.VERTICAL}
      spacing={4}
    >
      <box
        class="ContentInformation"
        orientation={Gtk.Orientation.HORIZONTAL}
        spacing={12}
        vexpand
      >
        <box class="ImageContainer" halign={Gtk.Align.START}>
          <overlay hexpand={false} vexpand={false}>
            <With value={faceUrl}>
              {(value) => value ? (
                <box
                  css={faceUrl(u => `background-image: url('file://${u!}')`)}
                  class="UserPfp"
                  widthRequest={64}
                  heightRequest={64}
                  hexpand
                  halign={Gtk.Align.CENTER}
                />
              ) : (
                <box
                  class="UserPfpFallback"
                  widthRequest={64}
                  heightRequest={64}
                  hexpand
                  halign={Gtk.Align.CENTER}
                >
                  <label
                    hexpand
                    vexpand
                    halign={Gtk.Align.CENTER}
                    valign={Gtk.Align.CENTER}
                    label={"\uE4D6"}
                  />
                </box>
              )}
            </With>
            <label
              $type="overlay"
              class="ContentOverlay"
              label={"\uE4C2"}
              hexpand
              vexpand
              valign={Gtk.Align.END}
              halign={Gtk.Align.END}
            />
          </overlay>
        </box>
        <box
          hexpand
          vexpand
          valign={Gtk.Align.CENTER}
          class="ContentContainer"
          orientation={Gtk.Orientation.VERTICAL}
          spacing={2}
        >
          <label
            label={capitalize(whoami)}
            hexpand
            halign={Gtk.Align.START}
            class="Whoami"
          />
          <label
            label={fmttedUptime(s => `Up ${s}`)}
            hexpand
            halign={Gtk.Align.START}
            class="Uptime"
          />
        </box>
      </box>
      <box
        hexpand
        vexpand
        valign={Gtk.Align.END}
        halign={Gtk.Align.END}
        orientation={Gtk.Orientation.HORIZONTAL}
        spacing={7}
        class="SystemActionButtons"
      >
        <button
          class="SystemActionButton LockButton"
          onClicked={handleLockPC}
          vexpand
          hexpand
          halign={Gtk.Align.CENTER}
          valign={Gtk.Align.CENTER}
        >
          <label label={"\uE308"} />
        </button>
        <button
          class="SystemActionButton PoweroffButton"
          onClicked={handlePoweroffPC}
          vexpand
          hexpand
          halign={Gtk.Align.CENTER}
          valign={Gtk.Align.CENTER}
        >
          <label label={"\uE3DA"} />
        </button>
      </box>
    </box>
  );
}

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
      <UserContainer />
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
      marginTop={7}
      application={app}
    >
      <box class="MainContent" orientation={Gtk.Orientation.HORIZONTAL}>
        <MainInformation />
        <Separator />
        <Notifications />
      </box>
    </window>
  );
}
