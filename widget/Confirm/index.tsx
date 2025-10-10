import app from "ags/gtk4/app";
import { Astal, Gtk, Gdk } from "ags/gtk4";
import Pango from "gi://Pango";

import { createBinding, createComputed, For, With } from "gnim";
import { Confirm as ConfirmService, type Action as ConfirmAction } from "../../services";

export default function Confirm(gdkmonitor: Gdk.Monitor) {
  const { TOP, LEFT, RIGHT, BOTTOM } = Astal.WindowAnchor;

  const confirm = ConfirmService.get_default();
  const visible = createBinding(confirm, "visible");
  const icon = createBinding(confirm, "icon");
  const iconStyle = createBinding(confirm, "icon_style");
  const title = createBinding(confirm, "title");
  const summary = createBinding(confirm, "summary");
  const actions = createBinding(confirm, "actions");

  const handleActionClick = (action: ConfirmAction) => {
    if (action.onClicked) action.onClicked(() => {
      confirm.closeConfirm();
    });
  }

  return (
    <window
      class="Confirm"
      name="Confirm"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.IGNORE}
      anchor={TOP | LEFT | RIGHT | BOTTOM}
      namespace="confirm"
      application={app}
      visible={visible}
      widthRequest={gdkmonitor.get_geometry().width}
      heightRequest={gdkmonitor.get_geometry().height}
    >
      <box
        vexpand
        hexpand
        class="BackgroundOverlay"
        orientation={Gtk.Orientation.VERTICAL}
      >
        <box
          vexpand
          hexpand
          valign={Gtk.Align.CENTER}
          halign={Gtk.Align.CENTER}
          class="Card"
          orientation={Gtk.Orientation.VERTICAL}
          widthRequest={320}
        >
          <overlay>
            <box hexpand vexpand orientation={Gtk.Orientation.VERTICAL}>
              <box
                hexpand
                valign={Gtk.Align.START}
                class="Header"
                orientation={Gtk.Orientation.HORIZONTAL}
              >
                <box
                  class="IconContainer"
                  hexpand
                  halign={Gtk.Align.CENTER}
                  vexpand
                  valign={Gtk.Align.CENTER}
                >
                  <label
                    hexpand
                    vexpand
                    halign={Gtk.Align.CENTER}
                    valign={Gtk.Align.CENTER}
                    class={iconStyle(style => `Icon ${style}`)}
                    label={icon}
                  />
                </box>
              </box>
              <box
                hexpand
                vexpand
                orientation={Gtk.Orientation.VERTICAL}
                spacing={12}
                class="ContentContainer"
              >
                <label
                  label={title}
                  class="Title"
                  hexpand
                  halign={Gtk.Align.CENTER}
                />
                <label
                  label={summary}
                  class="Summary"
                  hexpand
                  xalign={0.5}
                  halign={Gtk.Align.CENTER}
                />
              </box>
              <box
                hexpand
                homogeneous
                valign={Gtk.Align.END}
                class="FooterContainer"
                marginTop={22}
              >
                <For each={actions}>
                  {action => (
                    <button
                      hexpand
                      vexpand
                      class={action.style ?? ""}
                      onClicked={() => handleActionClick(action)}
                    >
                      {action.label}
                    </button>
                  )}
                </For>
              </box>
            </box>
            <button
              $type="overlay"
              vexpand
              hexpand
              valign={Gtk.Align.START}
              halign={Gtk.Align.END}
              class="CloseButton"
              label={"\uE4F6"}
              marginTop={7}
              marginEnd={7}
              onClicked={() => confirm.closeConfirm()}
            />
          </overlay>
        </box>
      </box>
    </window>
  );
}
