import app from "ags/gtk4/app";
import { Astal, Gdk, Gtk } from "ags/gtk4";
import { type Accessor, createBinding, createComputed, With } from "gnim";

import { User } from "../../services";
import { Body } from "./views";
import { CircularProgress } from "../common/circular-progress";
import { SystemStats } from "../../services/system-stats";

function Header() {
  const user = User.get_default();
  const stats = SystemStats.get_default();

  const pfp = createBinding(user, "pfp");
  const hasPfp = createComputed([pfp], p => p.length > 0);

  const cpu = createBinding(stats, "cpu");
  const ram = createBinding(stats, "ram");

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
        <With value={hasPfp}>
          {(value) => value ? (
            <box
              css={pfp(s => `background-image: url("file://${s}");`)}
              class="Pfp"
              widthRequest={32}
              heightRequest={32}
              valign={Gtk.Align.CENTER}
            />
          ) : (
            <box
              class="FallbackPfp"
              widthRequest={32}
              heightRequest={32}
              valign={Gtk.Align.CENTER}
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
        orientation={Gtk.Orientation.HORIZONTAL}
        spacing={12}
      >
        <CircularProgress
          percent={cpu}
          activeLookupColor="ags-cprgs-cpu-active-color"
        >
          <label
            hexpand
            vexpand
            valign={Gtk.Align.CENTER}
            halign={Gtk.Align.CENTER}
            label={"\uE610"}
            class="CpuIcon"
          />
        </CircularProgress>
        <CircularProgress
          percent={ram}
          activeLookupColor="ags-cprgs-ram-active-color"
        >
          <label
            hexpand
            vexpand
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.CENTER}
            label={"\uE9C4"}
            class="RamIcon"
          />
        </CircularProgress>
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
