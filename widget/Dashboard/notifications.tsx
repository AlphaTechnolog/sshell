import { Gtk } from "ags/gtk4";
import { createBinding, createComputed, createState, For, With } from "gnim";

import Notifd from "gi://AstalNotifd";
import { clamp, maxLength } from "../../utils";
import { S_PER_MS } from "../../constants";

const notifd = Notifd.get_default();

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

function NotifItem({ notif: n }: { notif: Notifd.Notification }) {
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

  return (
    <box
      hexpand
      orientation={Gtk.Orientation.VERTICAL}
      class="NotificationItem"
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
        spacing={12}
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
              label={maxLength(n.summary, 40)}
              class="Summary"
              hexpand
              halign={Gtk.Align.START}
            />
            {n.summary !== n.body && n.body.length > 0 && (
              <label
                label={n.body}
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

function NoNotifications() {
  return (
    <box
      vexpand
      hexpand
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
      orientation={Gtk.Orientation.VERTICAL}
      class="NoNotificationsContainer"
    >
      <label
        class="Icon"
        label={"\uec08"}
        halign={Gtk.Align.CENTER}
        valign={Gtk.Align.CENTER}
      />
      <label
        class="Title"
        label="Nothing here yet" 
        halign={Gtk.Align.CENTER}
        valign={Gtk.Align.CENTER}
      />
    </box>
  );
}

export default function Notifications() {
  const notifications = createBinding(notifd, "notifications");

  return (
    <box hexpand vexpand class="Right" widthRequest={400}>
      <centerbox
        vexpand
        hexpand
        orientation={Gtk.Orientation.VERTICAL}
      >
        <box $type="start" class="Header">
          <label
            vexpand
            hexpand
            halign={Gtk.Align.START}
            valign={Gtk.Align.CENTER}
            label="Notifications"
          />
        </box>
        <box
          $type="center"
          vexpand
          class="Content"
        >
          {/* TODO: Maybe scrollbar would be good visual indicator */}
          <scrolledwindow vexpand hexpand vscrollbarPolicy={Gtk.PolicyType.ALWAYS}>
            <box
              vexpand
              hexpand
              orientation={Gtk.Orientation.VERTICAL}
              homogeneous={false}
              spacing={12}
            >
              <With value={notifications}>
                {(value) => value.length === 0 && <NoNotifications />}
              </With>
              <For each={notifications}>
                {(notif) => <NotifItem notif={notif} />}
              </For>
            </box>
          </scrolledwindow>
        </box>
        <box $type="end" class="Footer">
          <button
            vexpand
            hexpand
            halign={Gtk.Align.END}
            valign={Gtk.Align.CENTER}
            class="ClearAllButton"
            label="Clear All"
            onClicked={() => notifications.get().forEach(n => n.dismiss())}
          />
        </box>
      </centerbox>
    </box>
  );
}
