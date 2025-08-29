import { Gtk } from "ags/gtk4";
import { ViewContainer } from "../view-container";
import { type ViewContentProps } from "../types";
import { createBinding, createComputed, type Accessor } from "gnim";

import Network from "gi://AstalNetwork";
import { Dnd } from "../../../../services";
import { useNetworkIcon } from "../../../../hooks";
import { execAsync } from "ags/process";

type ChipProps = {
  icon: string | Accessor<string>;
  label: string | Accessor<string>;
  summary: string | Accessor<string>;
  active?: Accessor<boolean>;
  showChevronRight?: boolean;
  onToggle?(): void;
  onConfig?(): void;
};

function Chip({
  icon,
  label,
  summary,
  active,
  showChevronRight = true,
  onToggle,
  onConfig,
}: ChipProps) {
  return (
    <box
      class={!active ? "Chip" : active(a => `Chip ${a ? "Active" : ""}`)}
      orientation={Gtk.Orientation.HORIZONTAL}
      hexpand
      vexpand
      spacing={2}
    >
      <button
        class={`ToggleIcon ${showChevronRight ? "" : "Only"}`}
        hexpand
        vexpand
        onClicked={onToggle}
      >
        <box vexpand hexpand orientation={Gtk.Orientation.HORIZONTAL} spacing={10}>
          <label label={icon} vexpand valign={Gtk.Align.CENTER} class="Icon" />
          <box
            hexpand
            vexpand
            valign={Gtk.Align.CENTER}
            orientation={Gtk.Orientation.VERTICAL}
            spacing={2}
          >
            <label
              halign={Gtk.Align.START}
              label={label}
              vexpand
              valign={Gtk.Align.CENTER}
              class="Title"
            />
            {summary && (
              <label
                halign={Gtk.Align.START}
                label={summary}
                vexpand
                valign={Gtk.Align.CENTER}
                class="Summary"
              />
            )}
          </box>
        </box>
      </button>
      <button
        class="ConfigButton"
        halign={Gtk.Align.END}
        vexpand
        onClicked={onConfig}
        label={"\uE13A"}
        visible={showChevronRight ?? true}
      />
    </box>
  );
}

function NetworkChip() {
  const { icon, primary, active } = useNetworkIcon();

  const handleToggle = () => {
    if (primary.get() === Network.Primary.WIFI) {
      // TODO: Do toggle
      execAsync("nmcli radio wifi off");
    }
  };

  const handleConfig = () => console.log("");

  return (
    <Chip
      icon={icon}
      label="Network"
      summary="Ethernet"
      active={active}
      onToggle={handleToggle}
      onConfig={handleConfig}
    />
  );
}

function DndChip() {
  const dnd = Dnd.get_default();
  const enabled = createBinding(dnd, "enabled");
  const icon = createComputed([enabled], e => {
    return e ? "\uE330" : "\uE5EA";
  })

  return (
    <Chip
      icon={icon}
      label="Dnd"
      summary={enabled(e => `Turned ${e ? "On" : "Off"}`)}
      active={enabled}
      onToggle={() => (dnd.enabled = !enabled.get())}
      showChevronRight={false}
    />
  );
}

export function Main(_: ViewContentProps) {
  return (
    <ViewContainer extraClass="MainView">
      <box vexpand hexpand orientation={Gtk.Orientation.VERTICAL} homogeneous spacing={12}>
        <box hexpand valign={Gtk.Align.CENTER} vexpand orientation={Gtk.Orientation.HORIZONTAL} homogeneous spacing={12}>
          <NetworkChip />
          <DndChip />
        </box>
        <box hexpand valign={Gtk.Align.CENTER} vexpand orientation={Gtk.Orientation.HORIZONTAL} homogeneous spacing={12}>
          <Chip
            icon={"\uE5D6"}
            label="Airplane mode"
            summary="Turned Off"
            showChevronRight={false}
          />
          <Chip
            icon={"\uE2DC"}
            label="Redshift"
            summary="Night Light is Off"
            showChevronRight={false}
          />
        </box>
      </box>
    </ViewContainer>
  );   
}
