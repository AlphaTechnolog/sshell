import app from "ags/gtk4/app";
import { createBinding, createComputed, createState } from "gnim";
import { Gtk } from "ags/gtk4";

import Wp from "gi://AstalWp";
import { Confirm, Dnd } from "../../services";

import { exec, execAsync } from "ags/process";
import { clamp } from "../../utils/math";

import MusicIndicator from "./music-indicator";
import { useNetworkIcon } from "../../hooks";
import { usePoweroff } from "../../hooks";

const wp = Wp.get_default();

// FIXME: I need to try this out in a system with wifi support
export function NetworkIcon() {
  const { icon } = useNetworkIcon();

  return (
    <label
      label={icon}
      class="PhosphorIcon"
    />
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

export function DndIcon() {
  const dnd = Dnd.get_default();
  const enabled = createBinding(dnd, "enabled");

  return (
    <label
      label={"\uE330"}
      visible={enabled}
      class="PhosphorIcon DndIcon"
    />
  );
}

export default function Actions(args: { $type: string; }) {
  const [visibleCC, setVisibleCC] = createState(false);
  const { poweroff } = usePoweroff();

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
          <DndIcon />
        </box>
      </button>
      <button
        class="Poweroff"
        iconName="system-shutdown"
        onClicked={poweroff}
      />
    </box>
  );
}
