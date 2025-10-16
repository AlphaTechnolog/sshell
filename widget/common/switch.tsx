import { Gtk } from "ags/gtk4";
import type { Accessor } from "gnim";

interface SwitchProps {
  enabled: Accessor<boolean>,
  onEnable(): void;
  onDisable(): void;
}

export function Switch({ enabled, onEnable, onDisable }: SwitchProps) {
  const toggle = () => {
    if (enabled.get()) onDisable();
    else onEnable();
  }

  return (
    <button
      vexpand
      valign={Gtk.Align.CENTER}
      class={enabled(e => `SwitchContainer ${e ? "Active" : "Inactive"}`)}
      onClicked={toggle}
    >
      <box
        class="Handle"
        hexpand
        halign={Gtk.Align.START}
      />
    </button>
  );
}
