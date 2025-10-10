import app from "ags/gtk4/app"
import style from "./style.scss"

import Bar from "./widget/Bar"
import Dashboard from "./widget/Dashboard";
import OSD from "./widget/OSD";
import Notifications from "./widget/Notifications";
import ControlCenter from "./widget/ControlCenter";
import Confirm from "./widget/Confirm";

app.start({
  css: style,
  main() {
    app.get_monitors().forEach((mon, idx) => {
      const isPrimary = idx === 0; // for wayland we've to stick with the first one
      Bar(mon);
      Dashboard(mon);
      ControlCenter(mon);
      if (isPrimary) {
        OSD(mon);
        Notifications(mon);
        Confirm(mon);
      }
    });
  },
})
