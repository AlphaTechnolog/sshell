import { Gtk } from "ags/gtk4";
import { ViewContainer } from "../view-container";
import { type ViewContentProps } from "../types";
import { createBinding, createComputed, createState, For, With, type Accessor } from "gnim";

import Hyprland from "gi://AstalHyprland";
import Network from "gi://AstalNetwork";
import { Dnd, Theme, ActiveThemes } from "../../../../services";
import { useNetworkIcon } from "../../../../hooks";
import { exec, execAsync } from "ags/process";
import { ControlSliders } from "../../../common";
import { S_PER_MS } from "../../../../constants";

type ChipProps = {
  icon: string | Accessor<string>;
  label: string | Accessor<string>;
  summary: string | Accessor<string>;
  active?: Accessor<boolean>;
  showChevronRight?: boolean | Accessor<boolean>;
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
  const toggleIconClass = createComputed(get => {
    let showIcon = false;
    if (typeof showChevronRight === "boolean") showIcon = showChevronRight;
    else showIcon = get(showChevronRight);
    return `ToggleIcon ${showIcon ? "" : "Only"}`;
  });

  return (
    <box
      class={!active ? "Chip" : active(a => `Chip ${a ? "Active" : ""}`)}
      orientation={Gtk.Orientation.HORIZONTAL}
      hexpand
      vexpand
      spacing={2}
    >
      <button
        class={toggleIconClass}
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

  const summary = createComputed(get => {
    switch (get(primary)) {
      case Network.Primary.WIFI: {
        return "Wi-Fi";
      }
      case Network.Primary.WIRED: {
        return "Ethernet";
      }
      default: {
        return "Unknown"
      }
    }
  });

  const handleConfig = () => console.log("");

  const handleToggle = () => {
    if (primary.get() === Network.Primary.WIFI) {
      // TODO: Implement wifi module (i have no wifi atm)
      execAsync("nmcli radio wifi off");
    }
  };

  return (
    <Chip
      icon={icon}
      label="Network"
      summary={summary}
      active={active}
      onToggle={handleToggle}
      onConfig={handleConfig}
      showChevronRight={primary(p => p === Network.Primary.WIFI)}
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

function DarkModeChip() {
  const theme = Theme.get_default();
  const activeTheme = createBinding(theme, "colorscheme");

  const icon = createComputed([activeTheme], (t) => {
    switch (t) {
      case ActiveThemes.dark: return "\uE53E";
      case ActiveThemes.light: return "\uE472";
      default: return "";
    }
  });

  const isActive = createComputed([activeTheme], (t) => {
    return t === ActiveThemes.dark;
  });

  const toggleTheme = () => {
    if (isActive.get()) {
      theme.colorscheme = ActiveThemes.light;
    } else {
      theme.colorscheme = ActiveThemes.dark;
    }
  }

  return (
    <Chip
      icon={icon}
      label="Dark mode"
      summary={isActive(a => a ? "Enabled" : "Disabled")}
      active={isActive}
      showChevronRight={false}
      onToggle={toggleTheme}
    />
  );
}

function Chips() {
  return (
    <box vexpand hexpand orientation={Gtk.Orientation.VERTICAL} homogeneous spacing={12}>
      <box hexpand valign={Gtk.Align.CENTER} vexpand orientation={Gtk.Orientation.HORIZONTAL} homogeneous spacing={12}>
        <NetworkChip />
        <DndChip />
      </box>
      <box hexpand valign={Gtk.Align.CENTER} vexpand orientation={Gtk.Orientation.HORIZONTAL} homogeneous spacing={12}>
        <DarkModeChip />
        <Chip
          icon={"\uE2DC"}
          label="Redshift"
          summary="Night Light is Off"
          showChevronRight={false}
        />
      </box>
    </box>
  );
}

function KeyboardLayouts() {
  const REVEAL_TIMEOUT = 0.5 * S_PER_MS;

  const hyprland = Hyprland.get_default();
  const [layouts, setLayouts] = createState<string[]>(["us"]);
  const [activeLayout, setActiveLayout] = createState<string>("us");
  const [revealChild, setRevealChild] = createState(true);

  const toggleLayouts = () => {
    setRevealChild(!revealChild.get());
  }

  const layoutNames = {
    "es": "Spanish",
    "us": "English (US)",
    "latam": "Spanish (Latin America)",
    "de": "German",
  }

  const getLayoutName = (layout: string): string => {
    if (layout in layoutNames) return layoutNames[layout as keyof typeof layoutNames];
    return layout;
  }

  const getKeymapInformation = async () => {
    try {
      const layouts = (await execAsync(["bash", "-c", "hyprctl devices -j | jq '.keyboards[] | select(.main == true) | .layout' -r"])).split(",");
      const activeLayoutIdx = await execAsync(["bash", "-c", "hyprctl devices -j | jq '.keyboards[] | select(.main == true) | .active_layout_index' -r"]);
      const activeLayout = layouts[Number(activeLayoutIdx)] ?? "<undefined>";
      setLayouts(layouts);
      setActiveLayout(activeLayout);
    } catch (err) {
      console.error("error occurred with layouts", err);
    }
  }

  getKeymapInformation();

  hyprland.connect("keyboard-layout", (_self, _0, _1) => {
    getKeymapInformation();
  });

  const setup = (self: Gtk.Button, layout: string) => {
    if (!self.has_css_class("Item")) self.add_css_class("Item");

    const update = () => {
      if (activeLayout.get() === layout) self.add_css_class("Active");
      else if (self.has_css_class("Active")) self.remove_css_class("Active");
    }

    update();
    activeLayout.subscribe(update);
  }

  const onChoose = (layout: string) => {
    const mainDevice = exec(["bash", "-c", "hyprctl devices -j | jq '.keyboards[] | select(.main == true) | .name' -r"]);
    const newIndex = layouts.get().indexOf(layout).toString();
    exec(["hyprctl", "switchxkblayout", mainDevice, newIndex])
  }

  return (
    <box class="KeyboardsLayout" orientation={Gtk.Orientation.VERTICAL}>
      <button
        vexpand
        hexpand
        valign={Gtk.Align.START}
        onClicked={toggleLayouts}
      >
        <box
          orientation={Gtk.Orientation.HORIZONTAL}
          class="HeaderContainer"
          hexpand
          vexpand
        >
          <box
            orientation={Gtk.Orientation.HORIZONTAL}
            spacing={7}
            hexpand
            vexpand
          >
            <label
              halign={Gtk.Align.START}
              valign={Gtk.Align.CENTER}
              label="Kb Layouts"
              class="Header"
            />
            <label
              class={revealChild(revealed => `CollapsedChip ${revealed ? "Invisible" : ""}`)}
              valign={Gtk.Align.CENTER}
              hexpand
              halign={Gtk.Align.START}
              label={activeLayout(getLayoutName)}
            />
          </box>
          <label
            hexpand
            halign={Gtk.Align.END}
            valign={Gtk.Align.CENTER}
            label={revealChild(visible => visible ? "\uE13C" : "\uE136")}
            class="RevealButton"
          />
        </box>
      </button>

      <Gtk.Revealer
        transition_type={Gtk.RevealerTransitionType.SLIDE_DOWN}
        transition_duration={REVEAL_TIMEOUT}
        revealChild={revealChild}
        hexpand
        vexpand
      >
        <box class="Content" orientation={Gtk.Orientation.VERTICAL} spacing={7} marginTop={12}>
          <For each={layouts}>
            {layout => (
              <button
                class="Item"
                hexpand
                valign={Gtk.Align.CENTER}
                onClicked={() => onChoose(layout)}
                $={(self: Gtk.Button) => setup(self, layout)}
              >
                <box orientation={Gtk.Orientation.HORIZONTAL} homogeneous vexpand hexpand>
                  <label
                    label={getLayoutName(layout)}
                    halign={Gtk.Align.START}
                    vexpand
                  />
                  <box
                    vexpand
                    halign={Gtk.Align.END}
                    class={activeLayout(a => a === layout ? "ActiveChip" : "ActiveChip Inactive")}
                  >
                    <label label={activeLayout(a => a === layout ? "Active" : " ")} />
                  </box>
                </box>
              </button>
            )}
          </For>
        </box>
      </Gtk.Revealer>
    </box>
  )
}

export function Main(_: ViewContentProps) {
  return (
    <ViewContainer extraClass="MainView">
      <box vexpand hexpand orientation={Gtk.Orientation.VERTICAL} spacing={12}>
        <Chips />
        <ControlSliders />
        <KeyboardLayouts />
      </box>
    </ViewContainer>
  );
}
