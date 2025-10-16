import { Gtk } from "ags/gtk4";
import type { Accessor } from "gnim";

interface SwitchProps {
  enabled: Accessor<boolean>,
  onEnable(): void;
  onDisable(): void;
}

export function Switch({ enabled, onEnable, onDisable }: SwitchProps) {
  const toggle = () => {
    if (enabled.get()) onEnable();
    else onDisable();
  }

  return (
    <button
      vexpand
      valign={Gtk.Align.CENTER}
      widthRequest={35}
      class={enabled(e => `SwitchContainer ${e ? "Active" : "Inactive"}`)}
      onClicked={toggle}
    >
      <box
        class="Handle"
        widthRequest={15}
        heightRequest={15}
        hexpand
        halign={enabled(e => e ? Gtk.Align.END : Gtk.Align.START)}
      />
    </button>
  );
}
