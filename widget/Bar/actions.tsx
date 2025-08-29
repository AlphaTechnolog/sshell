import app from "ags/gtk4/app";
import { createBinding, createComputed, createState } from "gnim";
import { Gtk } from "ags/gtk4";

import Network from "gi://AstalNetwork";
import Wp from "gi://AstalWp";
import { Dnd } from "../../services";

import { exec } from "ags/process";
import { clamp } from "../../utils/math";

import MusicIndicator from "./music-indicator";

const network = Network.get_default();
const wp = Wp.get_default();

// FIXME: I need to try this out in a system with wifi support
export function NetworkIcon() {
  const { UNMANAGED, FAILED, DISCONNECTED } = Network.DeviceState;

  const wiredIcon = createComputed([
    createBinding(network.wired, "iconName"),
    createBinding(network.wired, "state"),
  ], (icon, state) => [UNMANAGED, FAILED, DISCONNECTED].includes(state) ? "network-offline" : icon);

  return (
    <image iconName={wiredIcon} />
  );
}

export function VolumeIcon() {
  const SCROLL_STEP = 0.025;
  const volumeIcon = createBinding(wp.defaultSpeaker, "volumeIcon");

  const scrollController = new Gtk.EventControllerScroll({
    flags: Gtk.EventControllerScrollFlags.VERTICAL,
  });

  scrollController.connect("scroll", (_self, _dx, dy) => {
    const step = SCROLL_STEP * (dy * -1);
    wp.defaultSpeaker.volume = clamp(wp.defaultSpeaker.volume + step, 0, 1);
  });

  return (
    <image iconName={volumeIcon} $={self => self.add_controller(scrollController)} />
  );
}

export function MoonIcon() {
  const dnd = Dnd.get_default();
  const enabled = createBinding(dnd, "enabled");

  return (
    <image
      iconName="notifications-disabled-symbolic"
      visible={enabled}
    />
  );
}

export default function Actions(args: { $type: string; }) {
  const [visibleCC, setVisibleCC] = createState(false);

  const handleClick = () => {
    const cc = app.get_window("ControlCenter");
    if (cc) setVisibleCC(cc.visible = !cc.visible);
  }

  return (
    <box {...args} spacing={6} class="Actions">
      <MusicIndicator />
      <button
        class={visibleCC(v => `Button ${v ? "Active" : ""}`)}
        onClicked={handleClick}
      >
        <box spacing={10}>
          <NetworkIcon />
          <VolumeIcon />
          <MoonIcon />
        </box>
      </button>
      <button
        class="Poweroff"
        iconName="system-shutdown"
        // TODO: Show confirmation
        onClicked={() => exec("systemctl poweroff")}
      />
    </box>
  );
}
