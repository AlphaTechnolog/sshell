import app from "ags/gtk4/app";
import { Astal, Gdk, Gtk } from "ags/gtk4";
import type { Accessor } from "gnim";

import { Body } from "./views";

export default function ControlCenter(gdkmonitor: Gdk.Monitor) {
  const { TOP, RIGHT } = Astal.WindowAnchor;

  return (
    <window
      gdkmonitor={gdkmonitor}
      application={app}
      name="ControlCenter"
      class="ControlCenter"
      exclusivity={Astal.Exclusivity.NORMAL}
      anchor={TOP | RIGHT}
      marginTop={7}
      marginRight={7}
    >
      <box
        class="Container"
        hexpand
        vexpand
        valign={Gtk.Align.START}
        halign={Gtk.Align.CENTER}
        widthRequest={425}
        orientation={Gtk.Orientation.VERTICAL}
        spacing={12}
      >
        <Body />
      </box>
    </window>
  );
}
