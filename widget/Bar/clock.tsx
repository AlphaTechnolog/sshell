import app from "ags/gtk4/app";
import { exec } from "ags/process";
import { createPoll } from "ags/time";
import { S_PER_MS } from "../../constants";
import { createState } from "gnim";

export default function Clock(args: { $type: string; }) {
  const cmd = "date '+%I:%M %p • %a %b %d'";
  const time = createPoll(exec(cmd), 1 * S_PER_MS, cmd);
  const [visibleDashboard, setVisibleDashboard] = createState(false);

  const handleClick = () => {
    const dashboard = app.get_window("Dashboard");
    if (dashboard) setVisibleDashboard(dashboard.visible = !dashboard.visible);
  }

  return (
    <button
      {...args}
      class={visibleDashboard(v => `ClickableClock ${v ? "Active" : ""}`)}
      onClicked={handleClick}
    >
      <label label={time} />
    </button>
  );
}
