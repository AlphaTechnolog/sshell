import app from "ags/gtk4/app";
import { Astal, Gdk, Gtk } from "ags/gtk4";
import { type Accessor, createState, onCleanup, type Setter } from "gnim";
import Hyprland from "gi://AstalHyprland";
import { exec, execAsync } from "ags/process";
import { S_PER_MS } from "../../constants";
import { timeout, Timer } from "ags/time";

const hyprland = Hyprland.get_default();
const REVEAL_TIMEOUT = 0.45 * S_PER_MS;

function OSD({ visible, setVisible }: {
  visible: Accessor<boolean>,
  setVisible: Setter<boolean>
}) {
  const getKeyboardLayoutCmd = ['bash', '-c', "hyprctl devices -j | jq '.keyboards[] | select(.main == true) | .active_keymap' -r"];
  const keyboardIcon = "\uE2D8";
  const [keyboardLayout, setKeyboardLayout] = createState(exec(getKeyboardLayoutCmd));

  let timer: Timer | undefined = undefined;
  const show = () => {
    setVisible(true);
    if (timer) timer.cancel();
    timer = timeout(2 * S_PER_MS, () => setVisible(false));
  }

  hyprland.connect("keyboard-layout", async () => {
    setKeyboardLayout(await execAsync(getKeyboardLayoutCmd));
    show();
  });

  const setup = (self: Gtk.Box) => {
    const eventMotion = new Gtk.EventControllerMotion();
    self.add_controller(eventMotion);
    eventMotion.connect("enter", () => {
      if (timer) timer.cancel();
    });
    eventMotion.connect("leave", () => {
      timer = timeout(2 * S_PER_MS, () => setVisible(false));
    });
  }

  return (
    <box
      class={visible(v => `KBDLayout ${v ? "Visible" : "Hidden"}`)}
      vexpand
      hexpand
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
      orientation={Gtk.Orientation.VERTICAL}
      spacing={0}
      $={setup}
      widthRequest={220}
    >
      <label
        label={keyboardIcon}
        hexpand
        halign={Gtk.Align.CENTER}
        class="Icon"
      />
      <label
        label={keyboardLayout}
        hexpand
        halign={Gtk.Align.CENTER}
        class="LayoutName"
      />
    </box>
  );
}

export default function KBDLayout(gdkmonitor: Gdk.Monitor) {
  const [visible, setVisible] = createState(false);

  return (
    <window
      gdkmonitor={gdkmonitor}
      application={app}
      class="KBDLayout"
      layer={Astal.Layer.OVERLAY}
      keymode={Astal.Keymode.NONE}
      visible={visible}
      namespace="osd"
    >
      <box
        vexpand
        hexpand
        halign={Gtk.Align.CENTER}
        valign={Gtk.Align.CENTER}
      >
        <OSD visible={visible} setVisible={setVisible} />
      </box>
    </window>
  );
}
