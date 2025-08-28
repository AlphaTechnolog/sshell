import app from "ags/gtk4/app";
import { Gtk, Gdk, Astal } from "ags/gtk4";
import { createBinding, createComputed, createState, type Accessor, type Setter } from "gnim";

import Wp from "gi://AstalWp";
import { Brightness } from "../../services";
import { timeout } from "ags/time";
import { S_PER_MS } from "../../constants";

const brightness = Brightness.get_default();
const wp = Wp.get_default();

const REVEAL_TIMEOUT = 0.45 * S_PER_MS;

type OnScreenProgressProps = {
  visible: Accessor<boolean>,
  setVisible: Setter<boolean>,
};

function OnScreenProgress({ visible, setVisible }: OnScreenProgressProps) {
  const screenBrightness = createBinding(brightness, "screen");
  const volume = createBinding(wp.defaultSpeaker, "volume");
  const volumeIcon = createBinding(wp.defaultSpeaker, "volumeIcon");

  const [iconName, setIconName] = createState("");
  const [value, setValue] = createState(0)
  const [shown, setShown] = createState(visible.get());

  let count = 0;
  const show = (v: number, icon: string) => {
    setVisible(true);
    setValue(v);
    setIconName(icon);
    count++;
    timeout(2 * S_PER_MS, () => {
      count--;
      if (count === 0) setVisible(false);
    });
  }

  visible.subscribe(() => {
    if (visible.get() === false) {
      timeout(REVEAL_TIMEOUT, () => {
        setShown(visible.get());
      });
    } else setShown(visible.get());
  })

  if (brightness.available) screenBrightness.subscribe(() => {
    show(screenBrightness.get(), "display-brightness-symbolic");
  });

  volume.subscribe(() => {
    show(volume.get(), volumeIcon.get());
  });

  return (
    <revealer
      revealChild={visible}
      transitionType={Gtk.RevealerTransitionType.CROSSFADE}
      transitionDuration={REVEAL_TIMEOUT}
    >
      <box class={shown(v => `OSD ${v ? "Visible" : "Hidden"}`)}>
        <image iconName={iconName} />
        <levelbar valign={Gtk.Align.CENTER} widthRequest={180} value={value} />
        <label label={value(v => `${Math.floor(v * 100)}%`)} />
      </box>
    </revealer>
  );
}

export default function Bar(gdkmonitor: Gdk.Monitor) {
  const [visible, setVisible] = createState(false);

  const eventMotion = new Gtk.GestureClick();
  eventMotion.connect("released", () => {
    setVisible(false);
  });

  return (
    <window
      gdkmonitor={gdkmonitor}
      class="OSD"
      namespace="osd"
      layer={Astal.Layer.OVERLAY}
      keymode={Astal.Keymode.ON_DEMAND}
      anchor={Astal.WindowAnchor.BOTTOM}
      application={app}
      visible
      marginBottom={5}
    >
      <box vexpand hexpand $={self => self.add_controller(eventMotion)}>
        <OnScreenProgress visible={visible} setVisible={setVisible} />
      </box>
    </window>
  )
}
