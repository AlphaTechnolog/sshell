import { Gtk } from "ags/gtk4";
import type { Accessor } from "gnim";

export interface BatteryIconProps {
  percentage: number | Accessor<number>;
}

export function BatteryIcon({ percentage }: BatteryIconProps) {
  return (
    <box orientation={Gtk.Orientation.HORIZONTAL} hexpand vexpand>
      <box
        vexpand
        valign={Gtk.Align.CENTER}
        class="BatteryIconContainer"
      >
        <slider
          value={percentage}
          min={0}
          max={1}
          hexpand
          vexpand
          class="Slider"
        />
      </box>
      <box
        vexpand
        valign={Gtk.Align.CENTER}
        class="BatteryChip"
      />
    </box>
  );
}
