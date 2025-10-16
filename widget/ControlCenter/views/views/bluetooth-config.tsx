import { ViewContainer } from "../view-container";
import { Views, type ViewContentProps } from "../types";
import { Gtk } from "ags/gtk4";

import { Switch, BatteryIcon } from "../../../common";
import Bluetooth from "gi://AstalBluetooth";

import {
  type Accessor,
  createBinding,
  createComputed,
  For,
  With,
  createState
} from "gnim";

function Header({ changeView }: Partial<ViewContentProps>) {
  const bluetooth = Bluetooth.get_default();
  const powered = createBinding(bluetooth, "is_powered");

  const goback = () => {
    changeView && changeView(Views.Main);
  }

  return (
    <box
      hexpand
      vexpand
      valign={Gtk.Align.END}
      class="Header"
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
  );
}

function NoDevices() {
  return (
    <label
      label="No devices"
      valign={Gtk.Align.CENTER}
      hexpand
      halign={Gtk.Align.START}
    />
  );
}

function Device({ device, activeIndex, index, onSelect }: {
  device: Bluetooth.Device,
  activeIndex: Accessor<number>;
  index: Accessor<number>,
  onSelect(index: number): void;
}) {
  const isActive = createComputed(get => {
    return get(activeIndex) === get(index);
  });

  return (
    <button
      class={isActive(a => `DeviceItem ${a ? "Active" : ""}`)}
      onClicked={() => onSelect(index.get())}
    >
      <box
        vexpand
        valign={Gtk.Align.CENTER}
        hexpand
        orientation={Gtk.Orientation.HORIZONTAL}
        homogeneous={false}
      >
        <box
          vexpand
          halign={Gtk.Align.START}
          orientation={Gtk.Orientation.HORIZONTAL}
          spacing={14}
        >
          <image
            iconName={device.icon}
            vexpand
            valign={Gtk.Align.CENTER}
            halign={Gtk.Align.CENTER}
            pixelSize={20}
            class="Icon"
          />
          <box
            vexpand
            hexpand
            orientation={Gtk.Orientation.VERTICAL}
            spacing={4}
          >
            <label
              vexpand
              valign={Gtk.Align.CENTER}
              hexpand
              halign={Gtk.Align.START}
              label={device.name}
              class="DeviceName"
            />
            <label
              vexpand
              valign={Gtk.Align.CENTER}
              hexpand
              halign={Gtk.Align.START}
              visible={device.connected || device.paired}
              label={device.connected ? "Connected" : device.paired ? "Paired" : ""}
              class="DeviceStatus"
            />
          </box>
        </box>
        <box
          vexpand
          halign={Gtk.Align.END}
          orientation={Gtk.Orientation.HORIZONTAL}
          spacing={4}
          visible={device.battery_percentage !== -1}
        >
          <label
            label={`${device.battery_percentage * 100}%`}
            vexpand
            hexpand
            valign={Gtk.Align.CENTER}
            halign={Gtk.Align.END}
            class="BatteryPercentage"
          />
          <BatteryIcon
            percentage={device.battery_percentage}
          />
        </box>
      </box>
    </button>
  );
}

function DevicesList({ devices }: { devices: Accessor<Bluetooth.Device[]> }) {
  const [activeIndex, setActiveIndex] = createState(-1);

  const onSelectDevice = (devId: number) => {
    if (devId === activeIndex.get()) setActiveIndex(-1);
    else setActiveIndex(devId);
  }

  return (
    <box
      hexpand
      vexpand
      orientation={Gtk.Orientation.VERTICAL}
      spacing={12}
    >
      <With value={devices}>
        {elements => elements.length === 0 && <NoDevices />}
      </With>
      <For each={devices}>
        {(device, index) => (
          <Device
            device={device}
            index={index}
            activeIndex={activeIndex}
            onSelect={onSelectDevice}
          />
        )}
      </For>
    </box>
  );
}

function Body() {
  const bluetooth = Bluetooth.get_default();
  const powered = createBinding(bluetooth, "is_powered");
  const devices = createBinding(bluetooth, "devices");

  const paired = createComputed(get => {
    if (get(powered) === false) return [];
    return get(devices).filter(device => {
      return device.paired;
    });
  });

  const unpaired = createComputed(get => {
    if (get(powered) === false) return [];
    return get(devices).filter(device => {
      return !device.paired;
    });
  });

  return (
    <box
      vexpand
      hexpand
      class="Content"
      orientation={Gtk.Orientation.VERTICAL}
      spacing={12}
    >
      <box
        vexpand
        hexpand
        orientation={Gtk.Orientation.VERTICAL}
        spacing={12}
        visible={paired(p => p.length > 0)}
      >
        <label
          label="Paired devices"
          class="Title"
          valign={Gtk.Align.START}
          hexpand
          halign={Gtk.Align.START}
        />
        <scrolledwindow
          vexpand
          hexpand
          propagateNaturalHeight
          maxContentHeight={200}
        >
          <DevicesList devices={paired} />
        </scrolledwindow>
      </box>
      <box
        vexpand
        hexpand
        orientation={Gtk.Orientation.VERTICAL}
        spacing={12}
        visible={unpaired(d => d.length > 0)}
      >
        <label
          label="Unpaired devices"
          valign={Gtk.Align.START}
          hexpand
          halign={Gtk.Align.START}
          class="Title"
        />
        <scrolledwindow
          vexpand
          hexpand
          propagateNaturalHeight
          maxContentHeight={200}
        >
          <DevicesList devices={unpaired} />
        </scrolledwindow>
      </box>
    </box>
  );
}

export function BluetoothConfig({ changeView }: ViewContentProps) {
  return (
    <ViewContainer extraClass="BluetoothConfigView">
      <box vexpand hexpand orientation={Gtk.Orientation.VERTICAL}>
        <Header changeView={changeView} />
        <Body />
      </box>
    </ViewContainer>
  );
}
