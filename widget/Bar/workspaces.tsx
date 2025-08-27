import { createBinding } from "gnim";
import { Gtk } from "ags/gtk4";
import Hyprland from "gi://AstalHyprland?version=0.1"

const hyprland = Hyprland.get_default();
const MAX_WORKSPACES = 6;

function WorkspaceButton({ wsid }: { wsid: number }) {
  const clients = createBinding(hyprland, "clients");
  const focusedWorkspace = createBinding(hyprland, "focusedWorkspace");

  function updateActive(self: Gtk.Button) {
    const active = focusedWorkspace.get()?.id === wsid;
    const hasClass = self.has_css_class("Focused");
    if (!hasClass && active) self.add_css_class("Focused");
    else if (!active && hasClass) self.remove_css_class("Focused");
  }

  function updateOccupied(self: Gtk.Button) {
    const occupied = clients.get()?.some(c => c.workspace.id === wsid);
    const hasClass = self.has_css_class("Occupied");
    if (!hasClass && occupied) self.add_css_class("Occupied");
    else if (!occupied && hasClass) self.remove_css_class("Occupied");
  }

  function updateButtonState(self: Gtk.Button) {
    updateOccupied(self);
    updateActive(self);
  }

  function setup(self: Gtk.Button) {
    self.add_css_class("Button");
    updateButtonState(self);
    clients.subscribe(() => updateButtonState(self));
    focusedWorkspace.subscribe(() => updateButtonState(self));
  }

  function handleClicked() {
    hyprland.dispatch("workspace", String(wsid));
  }

  return (
    <button $={setup} onClicked={handleClicked}>
      {String(wsid)}
    </button>
  );
}

export default function Workspaces(args: Record<string, any>) {
  const focusedWorkspace = createBinding(hyprland, "focusedWorkspace");

  const scroller = new Gtk.EventControllerScroll({
    flags: Gtk.EventControllerScrollFlags.VERTICAL,
  });

  const setup = (self: Gtk.Box) => {
    self.add_controller(scroller);
  }

  scroller.connect("scroll", (_self, _dx, dy) => {
    const wsid = focusedWorkspace.get().id;
    let param = dy > 0 ? "+1" : "-1";
    if (wsid + dy > MAX_WORKSPACES) {
      param = String(1);
    } else if (dy < 0 && wsid == 1) {
      param = String(MAX_WORKSPACES);
    }

    hyprland.dispatch("workspace", param);
  });

  return (
    <box {...args} class="WorkspacesContainer" spacing={4} $={setup}>
      {Array.from({ length: MAX_WORKSPACES }, (_, i: number) => i + 1).map((wsid: number) => (
        <WorkspaceButton wsid={wsid} />
      ))}
    </box>
  )
}
