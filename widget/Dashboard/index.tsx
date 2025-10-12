import app from "ags/gtk4/app";
import GLib from "gi://GLib?version=2.0";
import { Astal, Gdk, Gtk } from "ags/gtk4";
import { createBinding, createComputed, createState, With } from "gnim";
import { createPoll } from "ags/time";
import { fileExists } from "../../utils/fs";
import { S_PER_MS } from "../../constants";

import MusicPlayer from "./music-player";
import Notifications from "./notifications";
import { LockScreen, Uptime, User } from "../../services/";
import { capitalize } from "../../utils";
import { Weather } from "../common";
import { usePoweroff } from "../../hooks";

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
  const user = User.get_default();

  const pfp = createBinding(user, "pfp");
  const hasPfp = createBinding(user, "has_pfp");
  const whoami = createBinding(user, "whoami");
  const fmttedUptime = createBinding(uptime, "formatted");

  const { poweroff } = usePoweroff();

  return (
    <box
      class="UserContainer"
      orientation={Gtk.Orientation.VERTICAL}
    >
      <box
        class="ContentInformation"
        orientation={Gtk.Orientation.HORIZONTAL}
        spacing={12}
        vexpand
      >
        <box class="ImageContainer" halign={Gtk.Align.START}>
          <overlay hexpand={false} vexpand={false}>
            <With value={hasPfp}>
              {(value) => value ? (
                <box
                  css={pfp(p => `background-image: url('file://${p!}')`)}
                  class="UserPfp"
                  widthRequest={70}
                  heightRequest={70}
                  vexpand
                  hexpand
                  valign={Gtk.Align.CENTER}
                  halign={Gtk.Align.CENTER}
                />
              ) : (
                <box
                  class="UserPfpFallback"
                  widthRequest={70}
                  heightRequest={70}
                  hexpand
                  vexpand
                  valign={Gtk.Align.CENTER}
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
            label={whoami(w => capitalize(w))}
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
          onClicked={() => LockScreen.get_default().open()}
          vexpand
          hexpand
          halign={Gtk.Align.CENTER}
          valign={Gtk.Align.CENTER}
        >
          <label label={"\uE308"} />
        </button>
        <button
          class="SystemActionButton PoweroffButton"
          onClicked={() => poweroff()}
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

function MainInformation() {
  return (
    <box
      hexpand
      vexpand
      class="Left"
      widthRequest={400}
      orientation={Gtk.Orientation.VERTICAL}
      spacing={16}
    >
      <Clock />
      <UserContainer />
      <Weather />
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
      marginTop={5}
      application={app}
      heightRequest={670}
      widthRequest={920}
    >
      <box class="MainContent" orientation={Gtk.Orientation.HORIZONTAL}>
        <MainInformation />
        <Separator />
        <Notifications />
      </box>
    </window>
  );
}
