import { ViewContainer } from "../view-container";
import { Views, type ViewContentProps } from "../types";
import { Gtk } from "ags/gtk4";

import Bluetooth from "gi://AstalBluetooth";

import { Switch } from "../../../common";
import { createBinding } from "gnim";

export function BluetoothConfig({ changeView }: ViewContentProps) {
  const bluetooth = Bluetooth.get_default();
  const powered = createBinding(bluetooth, "is_powered");

  const goback = () => {
    changeView(Views.Main);
  }

  return (
    <ViewContainer extraClass="BluetoothConfigView">
      <box vexpand hexpand orientation={Gtk.Orientation.VERTICAL} spacing={12}>
        <box vexpand hexpand>
          <label label="content" />
        </box>
        <box
          hexpand
          vexpand
          valign={Gtk.Align.END}
          class="Footer"
        >
          <box hexpand orientation={Gtk.Orientation.HORIZONTAL} spacing={10}>
            <button label={"\uE058"} class="GoBack" onClicked={() => goback()} />
            <label label="Bluetooth" />
          </box>
          <box hexpand halign={Gtk.Align.END}>
            <Switch
              enabled={powered}
              onEnable={() => bluetooth.toggle()}
              onDisable={() => bluetooth.toggle()}
            />
          </box>
        </box>
      </box>
    </ViewContainer>
  );
}
