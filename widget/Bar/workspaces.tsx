import { createBinding } from "gnim";
import { Gtk } from "ags/gtk4";
import Hyprland from "gi://AstalHyprland?version=0.1"

const hyprland = Hyprland.get_default();
const MIN_WORKSPACES = 6;

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

  return (
    <button $={setup} onClicked={() => hyprland.dispatch("workspace", String(wsid))}>
      {String(wsid)}
    </button>
  );
}

export default function Workspaces(args: { $type: string }) {
  return (
    <box {...args} class="WorkspacesContainer" spacing={4}>
      {Array.from({ length: MIN_WORKSPACES }, (_, i: number) => i + 1).map((wsid: number) => (
        <WorkspaceButton wsid={wsid} />
      ))}
    </box>
  )
}
