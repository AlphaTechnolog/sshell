import { ViewContainer } from "../view-container";
import { Views, type ViewContentProps } from "../types";
import { Gtk } from "ags/gtk4";

import { Switch, BatteryIcon } from "../../../common";
import Bluetooth from "gi://AstalBluetooth";

import { S_PER_MS } from "../../../../constants";
import { capitalize } from "../../../../utils";

import {
  type Accessor,
  createBinding,
  createComputed,
  For,
  createState,
  onCleanup
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

function Device({ device, activeIndex, index, onSelect, postDeviceAction }: {
  device: Bluetooth.Device,
  activeIndex: Accessor<number>;
  index: Accessor<number>,
  onSelect(index: number): void;
  postDeviceAction(device: Bluetooth.Device): void;
}) {
  const bluetooth = Bluetooth.get_default();

  const [isActionRunning, setIsActionRunning] = createState(false);
  const name = createBinding(device, "alias");
  const batteryPercentage = createBinding(device, "battery_percentage");
  const paired = createBinding(device, "paired");
  const connected = createBinding(device, "connected");

  const shouldShowStatus = createComputed(get => {
    return get(connected) || get(paired);
  });

  const statusLabel = createComputed(get => {
    return get(connected) ? "Connected" : get(paired) ? "Paired" : "";
  });

  const actionButtonLabel = createComputed(get => {
    const doing = get(isActionRunning) ? "ing..." : "";
    const prefix = get(connected) ? "dis" : "";
    return capitalize(prefix + "connect" + doing);
  });

  const isActive = createComputed(get => {
    return get(activeIndex) === get(index);
  });

  const onDisconnect = () => {
    if (isActive.get() && !bluetooth.get_devices().some(x => x.connected)) {
      onSelect(-1);
    }
  }

  const handleAction = async () => {
    setIsActionRunning(true);
    try {
      if (connected.get()) {
        device.disconnect_device(() => {
          onDisconnect();
          setIsActionRunning(false);
        });
      } else {
        device.connect_device(() => {
          setIsActionRunning(false);
        });
      }
    } catch (err) {
      console.error("Unable to execute default action for device: " + name.get() + ", error:", err)
    }
  }

  const disposePaired = paired.subscribe(() => postDeviceAction(device));
  const disposeConnected = connected.subscribe(() => postDeviceAction(device));

  onCleanup(() => {
    disposePaired();
    disposeConnected();
  });

  return (
    <box class={isActive(a => `DeviceItem ${a ? "Active" : ""}`)}>
      <Gtk.GestureClick
        $={self => {
          if (!isActive.get()) self.connect("pressed", () => {
            onSelect(index.get());
          });
        }}
      />
      <box vexpand hexpand orientation={Gtk.Orientation.VERTICAL}>
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
                label={name}
                class="DeviceName"
              />
              <label
                vexpand
                valign={Gtk.Align.CENTER}
                hexpand
                halign={Gtk.Align.START}
                visible={shouldShowStatus}
                label={statusLabel}
                class="DeviceStatus"
              />
            </box>
          </box>
          <box
            vexpand
            halign={Gtk.Align.END}
            orientation={Gtk.Orientation.HORIZONTAL}
            spacing={4}
            visible={batteryPercentage(percentage => percentage !== -1)}
          >
            <label
              label={batteryPercentage(percentage => `${percentage * 100}%`)}
              vexpand
              hexpand
              valign={Gtk.Align.CENTER}
              halign={Gtk.Align.END}
              class="BatteryPercentage"
            />
            <BatteryIcon percentage={batteryPercentage} />
          </box>
        </box>
        <box
          marginTop={12}
          hexpand
        >
          <button
            hexpand
            vexpand
            halign={Gtk.Align.END}
            valign={Gtk.Align.CENTER}
            class={isActive(a => `ActionButton ${a ? "MoreContrast" : ""}`)}
            onClicked={handleAction}
            label={actionButtonLabel}
          />
        </box>
      </box>
    </box>
  );
}

function DevicesList({ devices, postDeviceAction }: {
  devices: Accessor<Bluetooth.Device[]>,
  postDeviceAction(device: Bluetooth.Device): void;
}) {
  const [activeIndex, setActiveIndex] = createState(-1);

  const onSelectDevice = (devId: number) => {
    setActiveIndex(devId);
  }

  const updateActiveIndex = () => {
    const connection = devices.get().find(device => device.connected);
    if (!connection) return setActiveIndex(-1);
    if (activeIndex.get() === -1) {
      setActiveIndex(devices.get().indexOf(connection));
    }
  }

  updateActiveIndex();
  const dispose = devices.subscribe(updateActiveIndex);
  onCleanup(() => dispose());

  return (
    <box
      hexpand
      vexpand
      orientation={Gtk.Orientation.VERTICAL}
      spacing={12}
    >
      <For each={devices}>
        {(device, index) => (
          <Device
            device={device}
            index={index}
            activeIndex={activeIndex}
            postDeviceAction={postDeviceAction}
            onSelect={onSelectDevice}
          />
        )}
      </For>
    </box>
  );
}

function DevicesAccordion({
  label,
  withCount = false,
  devices,
  postDeviceAction,
}: {
  label: string;
  withCount?: boolean;
  devices: Accessor<Bluetooth.Device[]>,
  postDeviceAction(device: Bluetooth.Device): void;
}) {
  const [revealed, setRevealed] = createState(true);
  const REVEAL_TIMEOUT = 0.5 * S_PER_MS;

  const displayLabel = createComputed(get => {
    if (!withCount) return label;
    return `${label} - ${get(devices).length}`;
  });

  return (
    <box
      vexpand
      hexpand
      orientation={Gtk.Orientation.VERTICAL}
      visible={devices(d => d.length > 0)}
      class="Accordion"
    >
      <button
        class="Title"
        hexpand
        vexpand
        valign={Gtk.Align.START}
        onClicked={() => setRevealed(!revealed.get())}
      >
        <box
          vexpand
          hexpand
          orientation={Gtk.Orientation.HORIZONTAL}
        >
          <label
            label={displayLabel}
            hexpand
            halign={Gtk.Align.START}
            vexpand
            valign={Gtk.Align.CENTER}
          />
          <label
            hexpand
            halign={Gtk.Align.END}
            vexpand
            valign={Gtk.Align.CENTER}
            label={revealed(visible => visible ? "\uE13C" : "\uE136")}
            class="Icon"
          />
        </box>
      </button>

      <revealer
        hexpand
        vexpand
        transitionDuration={REVEAL_TIMEOUT}
        transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
        revealChild={revealed}
      >
        <scrolledwindow
          vexpand
          hexpand
          propagateNaturalHeight
          maxContentHeight={200}
          marginTop={12}
        >
          <DevicesList devices={devices} postDeviceAction={postDeviceAction} />
        </scrolledwindow>
      </revealer>
    </box>
  );
}

function Body() {
  const bluetooth = Bluetooth.get_default();

  const [pairedDevices, setPairedDevices] = createState<Bluetooth.Device[]>(
    bluetooth.get_devices().filter(x => x.paired),
  );
  const [unpairedDevices, setUnpairedDevices] = createState<Bluetooth.Device[]>(
    bluetooth.get_devices().filter(x => !x.paired),
  );

  bluetooth.connect("device-added", (_, device) => {
    if (device.paired) setPairedDevices([
      ...pairedDevices.get(),
      device,
    ]);

    if (!device.paired) setUnpairedDevices([
      ...unpairedDevices.get(),
      device,
    ]);
  });

  bluetooth.connect("device-removed", (_, device) => {
    const variable = device.paired ? pairedDevices : unpairedDevices;
    const setter = device.paired ? setPairedDevices : setUnpairedDevices;
    const idx = variable.get().indexOf(device);
    setter([
      ...variable.get().slice(0, idx),
      ...variable.get().slice(idx + 1),
    ]);
  });

  const postDeviceAction = (device: Bluetooth.Device) => {
    const inPaired = pairedDevices.get().some(x => x.rssi === device.get_rssi());

    // if after connection & pairing but still not in paired section, we can
    // tryna resort it all.
    if ((device.paired || device.connected) && !inPaired) {
      let idx = 0;

      // first remove it from unpaired if needed.
      if ((idx = unpairedDevices.get().indexOf(device)) !== -1) {
        setUnpairedDevices([
          ...unpairedDevices.get().slice(0, idx),
          ...unpairedDevices.get().slice(idx + 1),
        ]);
      }

      setPairedDevices([...pairedDevices.get(), device]);
      return;
    }

    // in the other case, like, if it's not paired but still in the paired section
    // we'll have to resort it by removing if needed from paired and adding back.
    if ((!device.paired && !device.connected) && inPaired) {
      let idx = 0;

      // first remove from paired if we can.
      if ((idx = pairedDevices.get().indexOf(device)) !== -1) {
        setPairedDevices([
          ...pairedDevices.get().slice(0, idx),
          ...pairedDevices.get().slice(idx + 1),
        ]);
      }

      setUnpairedDevices([...unpairedDevices.get(), device]);
      return;
    }
  }

  return (
    <box
      vexpand
      hexpand
      class="Content"
      orientation={Gtk.Orientation.VERTICAL}
      spacing={12}
    >
      <DevicesAccordion
        label="Paired devices"
        devices={pairedDevices}
        postDeviceAction={postDeviceAction}
      />
      <DevicesAccordion
        label="Unpaired devices"
        devices={unpairedDevices}
        postDeviceAction={postDeviceAction}
      />
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
