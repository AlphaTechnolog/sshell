import { exec } from "ags/process";
import { createPoll } from "ags/time";
import { S_PER_MS } from "../../constants";

export default function Clock(args: { $type: string; }) {
  const cmd = "date '+%I:%M %p • %a %b %d'";
  const time = createPoll(exec(cmd), 1 * S_PER_MS, cmd);

  return (
    <box {...args}>
      <label label={time} />
    </box>
  );
}
