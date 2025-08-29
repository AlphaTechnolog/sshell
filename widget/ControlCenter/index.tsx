import app from "ags/gtk4/app";
import { Astal, Gdk, Gtk } from "ags/gtk4";
import { type Accessor, createBinding, createComputed } from "gnim";

import { User } from "../../services";
import { Body } from "./views";

function Header() {
  const user = User.get_default();

  const pfp = createBinding(user, "pfp");
  const hasPfp = createComputed([pfp], p => p.length > 0);

  const close = () => app.get_window("ControlCenter")?.set_visible(false);

  return (
    <box
      hexpand
      valign={Gtk.Align.START}
      orientation={Gtk.Orientation.HORIZONTAL}
      class="Header"
    >
      <box
        hexpand
        halign={Gtk.Align.START}
        orientation={Gtk.Orientation.HORIZONTAL}
        spacing={10}
      >
        <box
          css={pfp(s => `background-image: url("file://${s}");`)}
          class="Pfp"
          widthRequest={32}
          heightRequest={32}
          valign={Gtk.Align.CENTER}
        />
        <button
          class="LogoutButton"
          label="Sign out"
          valign={Gtk.Align.CENTER}
          onClicked={() => console.log('TODO')}
        />
        <button
          class="LockButton"
          label={"\uE308"}
          valign={Gtk.Align.CENTER}
          onClicked={() => console.log("TODO")}
        />
        <button
          class="PoweroffButton"
          label={"\uE3DA"}
          valign={Gtk.Align.CENTER}
          onClicked={() => console.log("TODO")}
        />
      </box>
      <box
        hexpand
        halign={Gtk.Align.END}
      >
        <button
          class="CloseButton"
          label={"\uE13C"}
          valign={Gtk.Align.CENTER}
          onClicked={close}
        />
      </box>
    </box>
  )
}

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
      visible
    >
      <box
        class="Container"
        hexpand
        vexpand
        valign={Gtk.Align.START}
        halign={Gtk.Align.CENTER}
        widthRequest={400}
        orientation={Gtk.Orientation.VERTICAL}
        spacing={12}
      >
        <Header />
        <Body />
      </box>
    </window>
  );
}
