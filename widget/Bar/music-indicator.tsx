import { Gtk } from "ags/gtk4";
import { createBinding, createState, With } from "gnim";

import { S_PER_MS } from "../../constants";
import { maxLength } from "../../utils";

import Mpris from "gi://AstalMpris";
import GLib from "gi://GLib?version=2.0";

const spotify = Mpris.Player.new("spotify");

export default function MusicIndicator() {
  const REVEAL_TIMEOUT = 0.5 * S_PER_MS;
  const [revealChild, setRevealChild] = createState(false);

  const available = createBinding(spotify, "available");
  const title = createBinding(spotify, "title");
  const coverArt = createBinding(spotify, "coverArt");

  const chip = new Gtk.Label({ label: "\uf1bc", css_classes: ["MusicChip"] })
  const controller = new Gtk.EventControllerMotion();
  chip.add_controller(controller);
  chip.set_halign(Gtk.Align.END);

  let timer: GLib.Source | undefined = undefined;

  controller.connect("enter", () => {
    setRevealChild(true);
    if (Boolean(timer)) clearTimeout(timer!);
    if (!chip.has_css_class("Expanded"))
      chip.add_css_class("Expanded");
  });

  controller.connect("leave", () => {
    setRevealChild(false);
    timer = setTimeout(() => {
      if (chip.has_css_class("Expanded"))
        chip.remove_css_class("Expanded");
    }, REVEAL_TIMEOUT / 1.5);
  });

  return (
    <box class="MusicIndicator">
      <With value={available}>
        {(value) => value && (
          <box>
            <Gtk.Revealer
              transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
              transitionDuration={REVEAL_TIMEOUT}
              revealChild={revealChild}
              halign={Gtk.Align.START}
            >
              <box spacing={6} class="MusicTitle">
                <box
                  class="CoverArt"
                  css={coverArt(url => `background-image: url('file://${url}');`)}
                  widthRequest={18}
                  heightRequest={18}
                  valign={Gtk.Align.CENTER}
                />
                <label
                  label={title(t => maxLength(t, 50))}
                  valign={Gtk.Align.CENTER}
                />
              </box>
            </Gtk.Revealer>
            {chip}
          </box>
        )}
      </With>
    </box>
  );
}
