import { Gtk } from "ags/gtk4";
import { Launcher } from "../../services";

export default function AppsLauncher() {
  return (
    <button
      class="AppsLauncherButton"
      vexpand
      valign={Gtk.Align.CENTER}
      label={"\uE30C"}
      onClicked={() => Launcher.get_default().toggle()}
    />
  );
}
