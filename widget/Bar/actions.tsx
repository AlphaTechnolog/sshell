import { createBinding } from "gnim";
import MusicIndicator from "./music-indicator";

import Network from "gi://AstalNetwork";
import Wp from "gi://AstalWp";
import { exec } from "ags/process";

const network = Network.get_default();
const wp = Wp.get_default();

// FIXME: I need to try this out in a system with wifi support
export function NetworkIcon() {
  const wifiIcon = createBinding(network.wifi, "iconName");
  const wiredIcon = createBinding(network.wired, "iconName");

  return (
    <image iconName={wiredIcon(i => i ?? wifiIcon.get())} />
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
