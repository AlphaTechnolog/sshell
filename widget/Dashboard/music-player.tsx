import { Gtk } from "ags/gtk4";
import { execAsync } from "ags/process";
import { Accessor, createBinding, createComputed, createState, With } from "gnim";

import Mpris from "gi://AstalMpris";
import { maxLength } from "../../utils";

const spotify = Mpris.Player.new("spotify");

function CardContent({ blurredArt }: { blurredArt: Accessor<string> }) {
  const available = createBinding(spotify, "available");
  const title = createBinding(spotify, "title");
  const artist = createBinding(spotify, "artist");
  const playbackStatus = createBinding(spotify, "playbackStatus");
  const length = createBinding(spotify, "length");
  const position = createBinding(spotify, "position");
  const identity = createBinding(spotify, "identity");

  // Just returning spotify icon for now since I'm only tracking spotify atm.
  const icon = createComputed([identity], (_identity) => "\uf1bc");

  const containerCSS = createComputed(
    [available, blurredArt],
    (can, url) => {
      if (!can) return "";
      return `background-image: url("file://${url}")`;
    },
  )

  const trackTitle = createComputed(
    [available, title],
    (isAvailable, trackTitle) => isAvailable ? trackTitle : "No title",
  );

  const trackArtist = createComputed(
    [available, artist],
    (isAvailable, trackArtist) => isAvailable ? trackArtist : "No artist",
  );

  const trackPosition = createComputed(
    [available, position],
    (isAvailable, position) => isAvailable ? position : 0,
  );

  const trackLength = createComputed(
    [available, length],
    (isAvailable, length) => isAvailable ? length : 0,
  );

  const status = createComputed(
    [available, playbackStatus],
    (a, s) => a ? s : Mpris.PlaybackStatus.STOPPED,
  );

  const playPauseIcon = createComputed([status], s => {
    const { PLAYING, STOPPED, PAUSED } = Mpris.PlaybackStatus;
    if (s === PLAYING) return "\uE39E";
    if (s === STOPPED) return "\uE3D0";
    if (s === PAUSED) return "\uE3D0";
    return "";
  });

  return (
    <box
      class={available(isAvailable => `MusicPlayerContainer ${isAvailable ? "" : "Disabled"}`)}
      css={containerCSS}
      heightRequest={180}
      hexpand
      vexpand
      orientation={Gtk.Orientation.VERTICAL}
    >
      <box
        hexpand
        halign={Gtk.Align.START}
        valign={Gtk.Align.START}
        class="PlayingFromChip"
        visible={available}
      >
        <With value={available}>
          {(value) => value && (
            <box
              orientation={Gtk.Orientation.HORIZONTAL}
              vexpand
              hexpand
              spacing={10}
            >
              <label class="Icon" label={icon} />
              <label class="Contents" label={identity} />
            </box>
          )}
        </With>
      </box>

      <box
        vexpand
        valign={Gtk.Align.END}
        hexpand
        class="ControlsContainer"
        orientation={Gtk.Orientation.VERTICAL}
        spacing={12}
      >
        <box
          class="Information"
          orientation={Gtk.Orientation.HORIZONTAL}
          hexpand
        >
          <box
            halign={Gtk.Align.START}
            hexpand
            valign={Gtk.Align.CENTER}
            vexpand
            orientation={Gtk.Orientation.VERTICAL}
            spacing={4}
          >
            <label
              halign={Gtk.Align.START}
              label={trackTitle(t => maxLength(t, 35))}
              class="Title"
            />
            <label
              halign={Gtk.Align.START}
              label={trackArtist(a => maxLength(a, 35))}
              class="Artist"
              visible={trackArtist(a => a.length > 0)}
            />
          </box>
          <box
            halign={Gtk.Align.END}
            hexpand
            valign={Gtk.Align.CENTER}
            vexpand
          >
            <button
              halign={Gtk.Align.CENTER}
              hexpand
              valign={Gtk.Align.CENTER}
              vexpand
              onClicked={() => available.get() && spotify.play_pause()}
              label={playPauseIcon}
              class={status(s => `PlayPauseButton ${s === Mpris.PlaybackStatus.PLAYING ? "Playing" : ""}`)}
            />
          </box>
        </box>
        <box
          class="Controls"
          orientation={Gtk.Orientation.HORIZONTAL}
          hexpand
          spacing={10}
        >
          <button
            halign={Gtk.Align.START}
            valign={Gtk.Align.CENTER}
            vexpand
            label={"\uE5A4"}
            class="PreviousControl"
            onClicked={() => {
              if (available.get() && spotify.can_go_previous) {
                spotify.previous()
              }
            }}
          />
          <slider
            hexpand
            vexpand
            valign={Gtk.Align.CENTER}
            min={0}
            max={trackLength}
            value={trackPosition}
            onChangeValue={({ value }) => {
              if (available.get()) {
                spotify.position = value;
              }
            }}
          />
          <button
            halign={Gtk.Align.END}
            valign={Gtk.Align.CENTER}
            vexpand
            label={"\uE5A6"}
            class="NextControl"
            onClicked={() => {
              if (available.get() && spotify.can_go_next) {
                spotify.next();
              }
            }}
          />
        </box>
      </box>
    </box>
  );
}

export default function MusicPlayer() {
  const coverArt = createBinding(spotify, "coverArt");

  // doing it with state instead of with a computed, since i want to generate
  // the image asynchronously, so the thread does not block.
  const [blurredArt, setBlurredArt] = createState("");

  const artGradient = {
    from: "#000000",
    to: "#0000004D",
  };

  // FIXME: Make this work without imagemagick (just keep default image, will look ugly but will not crash.)
  const updateBlurredArt = async (image: string) => {
    const exists = await execAsync(`/usr/bin/env bash -c 'test -f ${image} && echo yes || echo no'`) === "yes";
    if (!exists) return "";

    const splitted = image.split("/");
    const dirname = splitted.slice(0, -1).join("/");
    const filename = splitted[splitted.length - 1] + ".blurred.png";

    const [width, height] = (await execAsync(`magick identify -format "%wx%h" ${image}`)).split("x");

    const cmd = `magick convert "${image}" \
      -blur 0x5 \
      ( -size "${width}x${height}" -background none -define gradient:direction=East gradient:${artGradient.from}-${artGradient.to} ) \
      -composite \
      "${dirname}/${filename}"`;

    try {
      await execAsync(cmd);
      setBlurredArt(`${dirname}/${filename}`);
    } catch (err) {
      console.log({ err });
      setBlurredArt(image);
    }
  }

  updateBlurredArt(coverArt.get());
  coverArt.subscribe(() => updateBlurredArt(coverArt.get()));

  return (
    <box vexpand hexpand>
      <CardContent blurredArt={blurredArt} />
    </box>
  );
}
