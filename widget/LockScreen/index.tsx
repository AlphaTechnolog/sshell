import app from "ags/gtk4/app";
import { Astal, Gdk, Gtk } from "ags/gtk4";
import { timeout } from "ags/time";
import { type Accessor, createBinding, createState, onCleanup } from "gnim";

import { LockScreen as LockScreenService } from "../../services";
import { S_PER_MS } from "../../constants";

import GdkPixbuf from "gi://GdkPixbuf?version=2.0";

const REVEAL_LOCKSCREEN_TIMEOUT = 1 * S_PER_MS;

function FullscreenImage({ mon }: { mon: Gdk.Monitor }) {
  const path = "/home/alpha/Pictures/alin-meceanu-R0Z02tpd4qY-unsplash.jpg";
  const [textureState, setTextureState] = createState<GdkPixbuf.Pixbuf | null>(null);

  try {
    const texture = GdkPixbuf.Pixbuf.new_from_file(path);
    setTextureState(texture);
  } catch (err) {
    console.error("Unable to load image", path, err);
    setTextureState(null);
  }

  const setupDrawingArea = (self: Gtk.DrawingArea) => {
    self.connect("resize", () => self.queue_draw());
    self.set_draw_func((self, cr, width, height) => {
      const pixbuf = textureState.get();
      if (!pixbuf) {
        cr.setSourceRGB(0, 0, 0);
        cr.paint();
        return;
      }

      const [imgWidth, imgHeight] = [pixbuf.get_width(), pixbuf.get_height()];
      const scaleX = width / imgWidth;
      const scaleY = height / imgHeight;

      cr.save();
      cr.scale(scaleX, scaleY);

      Gdk.cairo_set_source_pixbuf(cr, pixbuf, 0, 0);

      cr.paint();
      cr.restore();
    });
  }

  return (
    <drawingarea
      vexpand
      hexpand
      widthRequest={mon.geometry.width}
      heightRequest={mon.geometry.height}
      $={self => self.connect("realize", () => setupDrawingArea(self))}
    />
  );
}

function MainSurface({ mon, visible }: {
  visible: Accessor<boolean>,
  mon: Gdk.Monitor,
}) {
  // TODO: Use the wallpaper service.
  const path = "/home/alpha/Pictures/1-scenery-pink-lakeside-sunset-lake-landscape-scenic-panorama-7680x3215-144.blurred.png";
  const [revealChild, setRevealChild] = createState(visible.get());

  // 1. use visible to open lockscreen.
  // 2. use revealChild to close lockscreen.
  const disposeVisible = visible.subscribe(() => {
    if (visible.get()) timeout(0.5, () => {
      setRevealChild(true);
    });
  });

  const disposeRevealChild = revealChild.subscribe(() => {
    if (!revealChild.get()) {
      timeout(REVEAL_LOCKSCREEN_TIMEOUT, () => {
        LockScreenService.get_default().close();
      });
    }
  });

  onCleanup(() => {
    disposeVisible();
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
      >
        <label label="hello world" vexpand hexpand halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} />
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
      keymode={Astal.Keymode.NONE}
      exclusivity={Astal.Exclusivity.IGNORE}
      anchor={TOP | LEFT | RIGHT | BOTTOM}
      application={app}
      gdkmonitor={gdkmonitor}
      class="LockScreen"
      namespace="lockscreen"
    >
      <MainSurface mon={gdkmonitor} visible={visible} />
    </window>
  );
}
