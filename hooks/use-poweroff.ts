import { execAsync } from "ags/process";
import { Confirm } from "../services";

export function usePoweroff() {
  const poweroff = () => {
    Confirm.get_default().startConfirm({
      icon: "\uE3DA",
      iconStyle: "Error",
      title: "Power Off",
      summary: "What do you want to do?",
      actions: [
        {
          label: "Cancel",
          style: "Regular",
          onClicked: close => close(),
        },
        {
          label: "Reboot",
          style: "Warning",
          onClicked: close => {
            execAsync("reboot");
            close();
          },
        },
        {
          label: "Shutdown",
          style: "Error",
          onClicked: close => {
            execAsync(["systemctl", "poweroff"]);
            close();
          },
        },
      ],
    });
  }

  return { poweroff };
}
