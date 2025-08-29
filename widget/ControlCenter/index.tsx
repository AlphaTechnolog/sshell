import app from "ags/gtk4/app";
import { Astal, Gdk, Gtk } from "ags/gtk4";

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
        valign={Gtk.Align.CENTER}
        halign={Gtk.Align.CENTER}
        widthRequest={120}
        heightRequest={120}
      >
        <label
          label="hello world"
          hexpand
          vexpand
          valign={Gtk.Align.CENTER}
          halign={Gtk.Align.CENTER}
        />
      </box>
    </window>
  );
}
