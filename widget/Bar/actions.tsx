import { createBinding, createComputed } from "gnim";
import MusicIndicator from "./music-indicator";

import Network from "gi://AstalNetwork";
import Wp from "gi://AstalWp";
import { exec } from "ags/process";

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
  const volumeIcon = createBinding(wp.defaultSpeaker, "volumeIcon");

  return (
    <image iconName={volumeIcon} />
  );
}

export default function Actions(args: { $type: string; }) {
  return (
    <box {...args} spacing={6} class="Actions">
      <MusicIndicator />
      <button class="Button">
        <box spacing={10}>
          <NetworkIcon />
          <VolumeIcon />
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
