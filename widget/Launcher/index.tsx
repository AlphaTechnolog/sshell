import app from "ags/gtk4/app";

import { Astal, Gdk, Gtk } from "ags/gtk4";
import { type Accessor, createBinding, createComputed, createState, For, onCleanup } from "gnim";
import { Launcher as LauncherService } from "../../services";

import Apps from "gi://AstalApps";
import Graphene from "gi://Graphene";

import { clamp } from "../../utils";
import { execAsync } from "ags/process";
import { interval } from "ags/time";
import { S_PER_MS } from "../../constants";

const MAX_APPS = 8;

function useLaunch() {
  const launcherService = LauncherService.get_default();

  function launch(app?: Apps.Application) {
    if (app) {
      launcherService.close();
      app.launch();
    }
  }

  return { launch };
}

function AppItem({ app, index, selectedIndex }: {
  app: Apps.Application,
  index: Accessor<number>,
  selectedIndex: Accessor<number>,
}) {
  const { launch } = useLaunch();

  const classname = createComputed(get => {
    return get(selectedIndex) === get(index) ? "Selected" : "";
  });

  return (
    <button
      focusable={false}
      class={classname}
      onClicked={() => launch(app)}
    >
      <box spacing={16}>
        <image iconName={app.iconName} pixelSize={22} />
        <label label={app.name} maxWidthChars={40} wrap />
        <box spacing={10} hexpand halign={Gtk.Align.END}>
          <label label={"\uE1C4"} class="ShortcutIcon" />
          <label label={index(i => String(i + 1))} />
        </box>
      </box>
    </button>
  );
}

export default function Launcher(gdkmonitor: Gdk.Monitor) {
  const { TOP, RIGHT, BOTTOM, LEFT } = Astal.WindowAnchor;

  let contentbox: Gtk.Box;
  let searchentry: Gtk.Entry;
  let win: Gtk.Window;

  const apps = new Apps.Apps();
  const launcherService = LauncherService.get_default();

  interval(5 * S_PER_MS, () => apps.reload());

  const { launch } = useLaunch();

  const [appsList, setAppsList] = createState<Apps.Application[]>(apps.fuzzy_query("").slice(0, MAX_APPS));
  const [selectedIndex, setSelectedIndex] = createState(0);
  const visible = createBinding(launcherService, "visible");

  const disposeAppsList = appsList.subscribe(() => {
    if (appsList.get().length === 0) {
      setSelectedIndex(0);
    } else {
      setSelectedIndex(clamp(selectedIndex.get(), 0, appsList.get().length - 1));
    }
  });

  onCleanup(() => disposeAppsList());

  function search(text: string) {
    setAppsList(apps.fuzzy_query(text).slice(0, MAX_APPS));
  }

  function onKey(
    _e: Gtk.EventControllerKey,
    keyval: number,
    _: number,
    mod: number,
  ) {
    if (keyval === Gdk.KEY_Escape) {
      launcherService.close();
      return true;
    }

    if (keyval === Gdk.KEY_Up) {
      setSelectedIndex(clamp(selectedIndex.get() - 1, 0, appsList.get().length - 1));
      return true;
    }

    if (keyval === Gdk.KEY_Down) {
      setSelectedIndex(clamp(selectedIndex.get() + 1, 0, appsList.get().length - 1));
      return true;
    }

    if (mod === Gdk.ModifierType.ALT_MASK) {
      for (const i of [1, 2, 3, 4, 5, 6, 7, 8, 9] as const) {
        if (keyval === Gdk[`KEY_${i}`]) {
          return launch(appsList.get()[i - 1]);
        }
      }
    }

    return false;
  }

  function onClick(_e: Gtk.GestureClick, _: number, x: number, y: number) {
    const [, rect] = contentbox.compute_bounds(win);
    const position = new Graphene.Point({ x, y });

    if (!rect.contains_point(position)) {
      launcherService.close();
      return true;
    }
  }

  return (
    <window
      $={ref => (win = ref)}
      gdkmonitor={gdkmonitor}
      visible={visible}
      application={app}
      class="Launcher"
      name="Launcher"
      anchor={TOP | BOTTOM | LEFT | RIGHT}
      exclusivity={Astal.Exclusivity.IGNORE}
      keymode={Astal.Keymode.EXCLUSIVE}
      namespace="osd"
      onNotifyVisible={({ visible }) => {
        if (visible) searchentry.grab_focus();
        searchentry.set_text("");
      }}
    >
      <Gtk.EventControllerKey onKeyPressed={onKey} />
      <Gtk.GestureClick onPressed={onClick} />
      <box
        $={ref => (contentbox = ref)}
        class="ContentContainer"
        valign={Gtk.Align.CENTER}
        halign={Gtk.Align.CENTER}
        orientation={Gtk.Orientation.VERTICAL}
      >
        <box class="EntryContainer" spacing={12}>
          <label
            class="SearchIcon"
            label={"\uE30C"}
          />
          <entry
            hexpand
            class="Textbox"
            $={ref => (searchentry = ref)}
            onActivate={() => launch(appsList.get()[selectedIndex.get()])}
            onNotifyText={({ text }) => search(text)}
            placeholderText="Start typing to search"
          />
        </box>
        <box class="Separator" hexpand visible={appsList(l => l.length > 0)} />
        <box
          orientation={Gtk.Orientation.VERTICAL}
          class="Content"
          spacing={12}
          visible={appsList(l => l.length > 0)}
        >
          <For each={appsList}>
            {(app, index) => (
              <AppItem
                app={app}
                index={index}
                selectedIndex={selectedIndex}
              />
            )}
          </For>
        </box>
      </box>
    </window>
  );
}
