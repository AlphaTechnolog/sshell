import app from "ags/gtk4/app";
import { Gtk, Gdk, Astal } from "ags/gtk4";
import { createBinding, createState, For, Node } from "gnim";

import Notifd from "gi://AstalNotifd";
import { Dnd } from "../../services";

import { S_PER_MS } from "../../constants";
import { timeout } from "ags/time";
import { clamp, maxLength } from "../../utils";

type NotifProps = {
  notif: Notifd.Notification,
  remove(id: number): void;
};

function NotifFallbackIcon() {
  return (
    <label
      class="FallbackIcon"
      label={"\uE0D0"}
      widthRequest={54}
      heightRequest={54}
      valign={Gtk.Align.START}
      halign={Gtk.Align.CENTER}
    />
  );
}

function Notification({ notif: n, remove }: NotifProps) {
  const inhomeIcons = {
    "spotify": "\uf1bc", // nerd font
    "discord": "\uf1ff", // nerd font
    "vesktop": "\uf1ff", // nerd font
  };

  const injectActionClasses = (i: number): string => {
    if (n.actions.length === 1) return "Only";
    if (i === 0) return "First";
    if (i === n.actions.length - 1) return "End";
    return "";
  }

  const handleSetup = (_self: Gtk.Box) => timeout(5 * S_PER_MS, () => {
    remove(n.id);
  });

  return (
    <box
      widthRequest={330}
      hexpand
      orientation={Gtk.Orientation.VERTICAL}
      class="NotificationItem"
      $={handleSetup}
    >
      <box
        class="Header"
        hexpand
        valign={Gtk.Align.START}
        orientation={Gtk.Orientation.HORIZONTAL}
      >
        <label
          label={n.appName}
          class="AppName"
          valign={Gtk.Align.CENTER}
        />
        <button
          hexpand
          halign={Gtk.Align.END}
          valign={Gtk.Align.CENTER}
          onClicked={() => n.dismiss()}
          class="DismissButton"
        >
          <label label={"\uE4F6"} />
        </button>
      </box>
      <box
        hexpand
        class="Content"
        orientation={Gtk.Orientation.VERTICAL}
        spacing={8}
      >
        <box
          hexpand
          valign={Gtk.Align.START}
          orientation={Gtk.Orientation.HORIZONTAL}
          spacing={12}
        >
          {!Boolean(n.image) ? <NotifFallbackIcon /> : (
            <box
              class="IconsContainer"
              valign={Gtk.Align.START}
              halign={Gtk.Align.CENTER}
            >
              <overlay hexpand={false} vexpand={false}>
                <box
                  css={`background-image: url("file://${n.image}");`}
                  class={`NotifImage ${n.appName.toLowerCase() in inhomeIcons ? "GoodBorder" : "SubtleBorder"}`}
                  widthRequest={54}
                  heightRequest={54}
                />
                {n.appName.toLowerCase() in inhomeIcons && (
                  <label
                    label={inhomeIcons[n.appName.toLowerCase() as keyof typeof inhomeIcons]}
                    class={`InhomeIcon ${n.appName.toLowerCase()}`}
                    $type="overlay"
                    halign={Gtk.Align.END}
                    valign={Gtk.Align.END}
                  />
                )}
              </overlay>
            </box>
          )}
          <box
            hexpand
            valign={Gtk.Align.CENTER}
            orientation={Gtk.Orientation.VERTICAL}
            spacing={7}
            class="NotifInfo"
          >
            <label
              label={maxLength(n.summary, 30)}
              class="Summary"
              hexpand
              halign={Gtk.Align.START}
            />
            {n.summary !== n.body && n.body.length > 0 && (
              <label
                label={maxLength(n.body, 40)}
                class="Body"
                hexpand
                halign={Gtk.Align.START}
                wrap
                useMarkup
              />
            )}
          </box>
        </box>
        <box
          homogeneous
          orientation={Gtk.Orientation.HORIZONTAL}
          spacing={4}
          class="ActionsBox"
          visible={n.actions.length > 0}
        >
          {n.actions.slice(0, clamp(3, 0, n.actions.length)).map((action, i) => (
            <button
              class={`Action ${injectActionClasses(i)}`}
              hexpand
              onClicked={() => n.invoke(action.id)}
            >
              <label label={action.label} />
            </button>
          ))}
        </box>
      </box>
    </box>
  );
}

export default function Notifications(gdkmonitor: Gdk.Monitor) {
  const notifd = Notifd.get_default();
  const { TOP, RIGHT } = Astal.WindowAnchor;

  const dnd = Dnd.get_default();
  const enabledDnd = createBinding(dnd, "enabled");

  const [notifications, setNotifications] = createState<Array<NotifProps>>([]);
  const [visible, setVisible] = createState(true);
  const map = new Map<number, NotifProps>();

  const rerender = () => setNotifications([...map.values()].reverse());

  const set = (key: number, value: NotifProps) => {
    map.set(key, value);
    rerender();
  }

  const remove = (key: number) => {
    map.delete(key);
    rerender();
  }

  notifd.connect("notified", (_, id) => {
    if (!enabledDnd.get()) {
      set(id, {
        notif: notifd.get_notification(id),
        remove,
      });
    }
  })

  notifd.connect("resolved", (_, id) => {
    if (enabledDnd.get()) return;  // avoid unnecessary rerenders.
    remove(id);
  });

  notifications.subscribe(() => {
    setVisible(notifications.get().length > 0);
  });

  // visible is a terrible hack for some reason gtk won't stop
  // showing after the last notification gets closed if i use visible={visible}
  visible.subscribe(() => {
    app.toggle_window("NotificationsPopup");
  });

  return (
    <window
      visible
      name="NotificationsPopup"
      class="NotificationsPopup"
      exclusivity={Astal.Exclusivity.NORMAL}
      gdkmonitor={gdkmonitor}
      anchor={TOP | RIGHT}
      application={app}
      marginRight={12}
      marginTop={12}
    >
      <box
        vexpand
        hexpand
        class="Container"
        orientation={Gtk.Orientation.VERTICAL}
        spacing={12}
      >
        <For each={notifications}>
          {(args) => <Notification {...args} />}
        </For>
      </box>
    </window>
  );
}
