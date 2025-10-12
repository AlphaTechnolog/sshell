import app from "ags/gtk4/app";
import { Astal, Gdk, Gtk } from "ags/gtk4";
import { createPoll, timeout } from "ags/time";
import { type Accessor, createBinding, createState, onCleanup, With } from "gnim";

import Auth from "gi://AstalAuth";
import { LockScreen as LockScreenService, User } from "../../services";
import { S_PER_MS } from "../../constants";
import { capitalize } from "../../utils";

const REVEAL_LOCKSCREEN_TIMEOUT = 0.5 * S_PER_MS;

function MainSurface({ visible }: {
  visible: Accessor<boolean>,
  primary: boolean,
}) {
  // TODO: Use the wallpaper service.
  const path = "/home/alpha/Pictures/1-scenery-pink-lakeside-sunset-lake-landscape-scenic-panorama-7680x3215-144.blurred.png";

  const user = User.get_default();
  const pfp = createBinding(user, "pfp");
  const hasPfp = createBinding(user, "has_pfp");
  const whoami = createBinding(user, "whoami");

  const day = createPoll("00:00", 1 * S_PER_MS, "date '+%A %B %Y'");
  const time = createPoll("", 30 * S_PER_MS, "date '+%H:%M'", c => c.toUpperCase());

  const [errorMessage, setErrorMessage] = createState("");
  const [revealChild, setRevealChild] = createState(visible.get());

  // 1. use visible to open lockscreen.
  // 2. use revealChild to close lockscreen.
  const disposeRevealChild = revealChild.subscribe(() => {
    if (!revealChild.get()) {
      timeout(REVEAL_LOCKSCREEN_TIMEOUT, () => {
        LockScreenService.get_default().close();
      });
    }
  });

  const setupEntry = (self: Gtk.Entry) => {
    const disposeVisible = visible.subscribe(() => {
      if (visible.get()) {
        self.grab_focus_without_selecting();
        setRevealChild(true);
      }
    });

    onCleanup(() => {
      disposeVisible();
    });
  }

  const handlePasswordActivate = (self: Gtk.Entry) => {
    setErrorMessage("");
    Auth.Pam.authenticate(self.get_text(), (_, task) => {
      try {
        Auth.Pam.authenticate_finish(task);
        setRevealChild(false);
      } catch (err) {
        console.error("Auth failed with", err);
        setErrorMessage("Authentication failure");
      } finally {
        self.set_text("");
      }
    });
  }

  onCleanup(() => {
    disposeRevealChild();
  });

  return (
    <revealer
      revealChild={revealChild}
      transitionType={Gtk.RevealerTransitionType.CROSSFADE}
      transitionDuration={REVEAL_LOCKSCREEN_TIMEOUT}
      class="LockscreenRevealer"
    >
      <box
        vexpand
        hexpand
        css={`background-image: url("file://${path}");`}
        class="LockscreenContainer"
        orientation={Gtk.Orientation.VERTICAL}
      >
        <box
          vexpand
          valign={Gtk.Align.START}
          hexpand
          class="ClockSection"
          orientation={Gtk.Orientation.VERTICAL}
          spacing={4}
        >
          <label
            label={day}
            class="Date"
            hexpand
            vexpand
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.CENTER}
          />
          <label
            class="Hour"
            label={time}
            hexpand
            vexpand
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.CENTER}
          />
        </box>
        <box
          vexpand
          valign={Gtk.Align.END}
          hexpand
          class="LoginSection"
          orientation={Gtk.Orientation.VERTICAL}
          spacing={7}
        >
          <With value={hasPfp}>
            {(has) => has ? (
              <box
                class="ProfilePhoto"
                heightRequest={64}
                widthRequest={64}
                hexpand
                halign={Gtk.Align.CENTER}
                vexpand
                valign={Gtk.Align.CENTER}
                css={pfp(i => `background-image: url("file://${i}");`)}
              />
            ) : (
              <box
                class="FallbackProfilePhoto"
                widthRequest={64}
                heightRequest={64}
                hexpand
                vexpand
                valign={Gtk.Align.CENTER}
                halign={Gtk.Align.CENTER}
              >
                <label
                  hexpand
                  vexpand
                  halign={Gtk.Align.CENTER}
                  valign={Gtk.Align.CENTER}
                  label={"\uE4D6"}
                />
              </box>
            )}
          </With>
          <label
            label={whoami(u => capitalize(u))}
            class="Username"
            hexpand
            halign={Gtk.Align.CENTER}
            vexpand
            valign={Gtk.Align.CENTER}
          />
          <entry
            placeholderText="Enter Password"
            class="PasswordEntry"
            vexpand
            valign={Gtk.Align.CENTER}
            hexpand
            halign={Gtk.Align.CENTER}
            widthRequest={64}
            visibility={false}
            onActivate={handlePasswordActivate}
            $={setupEntry}
          />
          <With value={errorMessage}>
            {(value) => value.length > 0 && (
              <label
                label={errorMessage}
                hexpand
                halign={Gtk.Align.CENTER}
                vexpand
                valign={Gtk.Align.CENTER}
                class="ErrorMessage"
              />
            )}
          </With>
        </box>
      </box>
    </revealer>
  );
}

export default function LockScreen(gdkmonitor: Gdk.Monitor, primary: boolean) {
  const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor;

  const lockscreen = LockScreenService.get_default();
  const visible = createBinding(lockscreen, "visible");

  return (
    <window
      visible={visible}
      keymode={Astal.Keymode.EXCLUSIVE}
      exclusivity={Astal.Exclusivity.IGNORE}
      anchor={TOP | LEFT | RIGHT | BOTTOM}
      application={app}
      gdkmonitor={gdkmonitor}
      class="LockScreen"
      namespace="lockscreen"
    >
      <MainSurface primary={primary} visible={visible} />
    </window>
  );
}
