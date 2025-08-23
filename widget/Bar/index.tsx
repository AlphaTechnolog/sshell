import app from "ags/gtk4/app";
import { Gdk } from "ags/gtk4";
import { Astal } from "ags/gtk4"

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
        <Workspaces $type="start" />
        <Clock $type="center" />
        <Actions $type="end" />
      </centerbox>
    </window>
  )
}
