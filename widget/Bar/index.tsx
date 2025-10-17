import app from "ags/gtk4/app";
import { Gtk, Gdk, Astal } from "ags/gtk4";

import AppsLauncher from "./apps-launcher";
import Workspaces from "./workspaces";
import Clock from "./clock";
import Actions from "./actions";

export default function Bar(gdkmonitor: Gdk.Monitor) {
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;

  return (
    <window
      visible
      class="Bar"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={TOP | LEFT | RIGHT}
      application={app}
    >
      <centerbox cssName="centerbox">
        <box
          $type="start"
          orientation={Gtk.Orientation.HORIZONTAL}
          spacing={7}
        >
          <AppsLauncher />
          <Workspaces />
        </box>
        <Clock $type="center" />
        <Actions $type="end" />
      </centerbox>
    </window>
  )
}
